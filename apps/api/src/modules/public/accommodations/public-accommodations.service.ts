import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult, PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  Amenities,
  Destinations,
  Properties,
  PropertyAmenities,
  PropertyImages,
  RoomAvailability,
  Rooms,
} from '../../../entities/generated';
import { ReviewsService } from '../../resources/reviews/reviews.service';
import { ReviewDto } from '../../resources/reviews/dto/review.dto';
import { PropertyDetailQueryDto } from './dto/property-detail-query.dto';
import { PropertyDetailDto } from './dto/property-detail.dto';
import { PropertySearchQueryDto } from './dto/property-search-query.dto';
import { PropertySearchResultDto } from './dto/property-search-result.dto';
import { PublicDestinationDto } from './dto/public-destination.dto';
import { PublicDestinationHighlightDto } from './dto/public-destination-highlight.dto';
import { enumerateMonthDays, enumerateStayNights } from './stay-dates.util';

const DISPLAY_AMENITY_CODES = new Set([
  'wifi',
  'pool',
  'breakfast',
  'spa',
  'parking',
]);

const PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg';

@Injectable()
export class PublicAccommodationsService {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(RoomAvailability)
    private readonly availabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(PropertyImages)
    private readonly imagesRepository: Repository<PropertyImages>,
    @InjectRepository(PropertyAmenities)
    private readonly propertyAmenitiesRepository: Repository<PropertyAmenities>,
    @InjectRepository(Amenities)
    private readonly amenitiesRepository: Repository<Amenities>,
    private readonly reviewsService: ReviewsService,
  ) {}

  async listDestinations(): Promise<PublicDestinationDto[]> {
    const rows = await this.destinationsRepository
      .createQueryBuilder('d')
      .select(['d.id', 'd.name', 'd.countryCode'])
      .where('d.deletedAt IS NULL')
      .orderBy('d.name', 'ASC')
      .getMany();

    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      countryCode: d.countryCode,
    }));
  }

  async listFeaturedDestinations(limit = 4): Promise<PublicDestinationHighlightDto[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 12);
    const rows = await this.destinationsRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.name',
        'd.slug',
        'd.countryCode',
        'd.description',
        'd.imageUrl',
      ])
      .where('d.deletedAt IS NULL')
      .andWhere('d.isFeatured = :featured', { featured: true })
      .orderBy('d.name', 'ASC')
      .take(safeLimit)
      .getMany();

    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      countryCode: d.countryCode,
      description: d.description,
      imageUrl: d.imageUrl?.trim() || PLACEHOLDER_IMAGE,
    }));
  }

  async search(
    query: PropertySearchQueryDto,
  ): Promise<PaginatedResult<PropertySearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const guests = query.guests ?? 1;

    let destinationIds: string[] | undefined;
    if (query.destinationId) {
      destinationIds = [query.destinationId];
    } else if (query.destination?.trim()) {
      const matchingDests = await this.destinationsRepository
        .createQueryBuilder('d')
        .select('d.id')
        .where('d.deletedAt IS NULL')
        .andWhere('LOWER(d.name) LIKE :pattern', {
          pattern: `%${query.destination.trim().toLowerCase()}%`,
        })
        .getMany();
      destinationIds = matchingDests.map((d) => d.id);
      if (!destinationIds.length) {
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 1 },
        };
      }
    }

    const propQb = this.propertiesRepository
      .createQueryBuilder('prop')
      .where('prop.deletedAt IS NULL');

    if (destinationIds?.length) {
      propQb.andWhere('prop.destinationId IN (:...destinationIds)', {
        destinationIds,
      });
    }

    if (query.propertyType) {
      propQb.andWhere('prop.propertyType = :propertyType', {
        propertyType: query.propertyType,
      });
    }

    const propertyEntities = await propQb
      .orderBy('prop.createdAt', 'DESC')
      .getMany();

    if (!propertyEntities.length) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 1 },
      };
    }

    const destIds = [...new Set(propertyEntities.map((p) => p.destinationId))];
    const destinations = await this.destinationsRepository.find({
      where: { id: In(destIds) },
    });
    const destById = new Map(
      destinations
        .filter((d) => !d.deletedAt)
        .map((d) => [d.id, { name: d.name, countryCode: d.countryCode }] as const),
    );

    const propertyIds = propertyEntities.map((p) => p.id);
    const stayNights =
      query.checkIn && query.checkOut
        ? enumerateStayNights(query.checkIn, query.checkOut)
        : null;

    const rooms = await this.roomsRepository.find({
      where: {
        propertyId: In(propertyIds),
      },
    });

    const eligibleRooms = rooms.filter(
      (r) => !r.deletedAt && r.maxGuests >= guests,
    );

    const roomsByProperty = new Map<string, Rooms[]>();
    for (const room of eligibleRooms) {
      const list = roomsByProperty.get(room.propertyId) ?? [];
      list.push(room);
      roomsByProperty.set(room.propertyId, list);
    }

    const roomIds = eligibleRooms.map((r) => r.id);
    const availabilityByRoomDate = await this.loadAvailabilityMap(roomIds, stayNights);

    const images = await this.imagesRepository.find({
      where: { propertyId: In(propertyIds) },
      order: { sortOrder: 'ASC' },
    });
    const imageByProperty = new Map<string, string>();
    for (const img of images) {
      if (!img.deletedAt && !imageByProperty.has(img.propertyId)) {
        imageByProperty.set(img.propertyId, img.url);
      }
    }

    const amenityCodesByProperty = await this.loadAmenityCodes(propertyIds);

    const results: PropertySearchResultDto[] = [];

    for (const prop of propertyEntities) {
      const propRooms = roomsByProperty.get(prop.id);
      if (!propRooms?.length) continue;

      const pricing = this.computeMinNightlyPrice(
        propRooms,
        stayNights,
        availabilityByRoomDate,
      );
      if (pricing === null) continue;

      const dest = destById.get(prop.destinationId);
      if (!dest) continue;

      const starRating = this.parseStarRating(prop.starRating);

      results.push({
        id: prop.id,
        slug: prop.slug,
        name: prop.name,
        propertyType: prop.propertyType,
        starRating,
        destinationName: dest.name,
        countryCode: dest.countryCode,
        addressLine: prop.addressLine ?? null,
        imageUrl: imageByProperty.get(prop.id) ?? PLACEHOLDER_IMAGE,
        minPriceCents: pricing.minPriceCents,
        currency: pricing.currency,
        amenityCodes: amenityCodesByProperty.get(prop.id) ?? [],
      });
    }

    results.sort((a, b) => a.minPriceCents - b.minPriceCents);

    const total = results.length;
    const offset = (page - 1) * limit;
    const data = results.slice(offset, offset + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string, query: PropertyDetailQueryDto): Promise<PropertyDetailDto> {
    const guests = query.guests ?? 1;
    const prop = await this.findPropertyOrThrow(id);

    const dest = await this.destinationsRepository.findOne({
      where: { id: prop.destinationId },
    });
    if (!dest || dest.deletedAt) {
      throw new NotFoundException('Hébergement introuvable.');
    }

    const stayNights =
      query.checkIn && query.checkOut
        ? enumerateStayNights(query.checkIn, query.checkOut)
        : null;

    const calendarDates = query.month ? enumerateMonthDays(query.month) : [];
    const allDates = [
      ...new Set([...(stayNights ?? []), ...calendarDates]),
    ];

    const allRooms = await this.roomsRepository.find({
      where: { propertyId: prop.id },
    });
    const eligibleRooms = allRooms.filter(
      (r) => !r.deletedAt && r.maxGuests >= guests,
    );

    const roomIds = eligibleRooms.map((r) => r.id);
    const availabilityByRoomDate = await this.loadAvailabilityMap(
      roomIds,
      allDates.length ? allDates : null,
    );

    const imageRows = await this.imagesRepository.find({
      where: { propertyId: prop.id },
      order: { sortOrder: 'ASC' },
    });
    const activeImages = imageRows.filter((img) => !img.deletedAt);
    const images =
      activeImages.length > 0
        ? activeImages.map((img) => ({
            id: img.id,
            url: img.url,
            caption: img.caption ?? null,
            sortOrder: img.sortOrder,
          }))
        : [
            {
              id: 'placeholder',
              url: PLACEHOLDER_IMAGE,
              caption: null,
              sortOrder: 0,
            },
          ];

    const amenities = await this.loadPropertyAmenities(prop.id);

    const roomDtos = eligibleRooms.map((room) => {
      const stayPricing = stayNights?.length
        ? this.computeRoomStayPricing(room, stayNights, availabilityByRoomDate)
        : null;

      return {
        id: room.id,
        name: room.name,
        roomType: room.roomType ?? null,
        maxGuests: room.maxGuests,
        bedConfig: room.bedConfig ?? null,
        basePriceCents: room.basePriceCents,
        currency: room.currency,
        totalPriceCents: stayPricing?.totalPriceCents ?? null,
        available: stayPricing?.available ?? true,
        nightlyBreakdown: stayPricing?.nightlyBreakdown ?? [],
      };
    });

    let minTotalCents: number | null = null;
    let stayCurrency = eligibleRooms[0]?.currency ?? 'USD';
    for (const room of roomDtos) {
      if (
        room.available &&
        room.totalPriceCents != null &&
        (minTotalCents === null || room.totalPriceCents < minTotalCents)
      ) {
        minTotalCents = room.totalPriceCents;
        stayCurrency = room.currency;
      }
    }

    const calendarDays = calendarDates.map((date) => {
      const dayPricing = this.computeMinNightlyPrice(
        eligibleRooms,
        [date],
        availabilityByRoomDate,
      );
      const anyAvailable = eligibleRooms.some((room) => {
        const avail = availabilityByRoomDate.get(`${room.id}:${date}`);
        return !avail || avail.availableUnits > 0;
      });
      return {
        date,
        minPriceCents: dayPricing?.minPriceCents ?? 0,
        available: anyAvailable && (dayPricing !== null),
        currency: dayPricing?.currency ?? stayCurrency,
      };
    });

    const basePricing = this.computeMinNightlyPrice(
      eligibleRooms,
      null,
      availabilityByRoomDate,
    );

    const { averageRating, reviewCount } =
      await this.reviewsService.aggregateForProperty(prop.id);

    return {
      id: prop.id,
      slug: prop.slug,
      name: prop.name,
      description: prop.description ?? null,
      propertyType: prop.propertyType,
      starRating: this.parseStarRating(prop.starRating),
      destinationName: dest.name,
      countryCode: dest.countryCode,
      addressLine: prop.addressLine ?? null,
      images,
      amenities,
      rooms: roomDtos,
      stay: {
        checkIn: query.checkIn ?? null,
        checkOut: query.checkOut ?? null,
        nights: stayNights?.length ?? 0,
        guests,
        minTotalCents,
        currency: stayCurrency || basePricing?.currency || 'USD',
      },
      calendarDays,
      averageRating,
      reviewCount,
    };
  }

  async listPropertyReviews(
    propertyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ReviewDto>> {
    await this.findPropertyOrThrow(propertyId);
    return this.reviewsService.listForProperty(propertyId, query);
  }

  private async findPropertyOrThrow(id: string): Promise<Properties> {
    const prop = await this.propertiesRepository.findOne({ where: { id } });
    if (!prop || prop.deletedAt) {
      throw new NotFoundException('Hébergement introuvable.');
    }
    return prop;
  }

  private parseStarRating(value: unknown): number | null {
    if (value == null || value === '') return null;
    const n = Number.parseFloat(String(value));
    return Number.isFinite(n) ? n : null;
  }

  private resolveNightPrice(
    room: Rooms,
    date: string,
    availabilityByRoomDate: Map<string, RoomAvailability>,
  ): { priceCents: number; available: boolean } {
    const avail = availabilityByRoomDate.get(`${room.id}:${date}`);
    if (avail) {
      return {
        priceCents: avail.availableUnits > 0 ? avail.priceCents : room.basePriceCents,
        available: avail.availableUnits > 0,
      };
    }
    return { priceCents: room.basePriceCents, available: true };
  }

  private computeRoomStayPricing(
    room: Rooms,
    stayNights: string[],
    availabilityByRoomDate: Map<string, RoomAvailability>,
  ): {
    totalPriceCents: number;
    available: boolean;
    nightlyBreakdown: { date: string; priceCents: number }[];
  } {
    let total = 0;
    let available = true;
    const nightlyBreakdown: { date: string; priceCents: number }[] = [];

    for (const night of stayNights) {
      const { priceCents, available: nightAvailable } = this.resolveNightPrice(
        room,
        night,
        availabilityByRoomDate,
      );
      if (!nightAvailable) available = false;
      total += priceCents;
      nightlyBreakdown.push({ date: night, priceCents });
    }

    return { totalPriceCents: total, available, nightlyBreakdown };
  }

  private async loadAvailabilityMap(
    roomIds: string[],
    dates: string[] | null,
  ): Promise<Map<string, RoomAvailability>> {
    const map = new Map<string, RoomAvailability>();
    if (!dates?.length || !roomIds.length) return map;

    const availabilityRows = await this.availabilityRepository
      .createQueryBuilder('ra')
      .where('ra.deletedAt IS NULL')
      .andWhere('ra.roomId IN (:...roomIds)', { roomIds })
      .andWhere('ra.date IN (:...dates)', { dates })
      .getMany();

    for (const row of availabilityRows) {
      map.set(`${row.roomId}:${row.date}`, row);
    }
    return map;
  }

  private computeMinNightlyPrice(
    rooms: Rooms[],
    stayNights: string[] | null,
    availabilityByRoomDate: Map<string, RoomAvailability>,
  ): { minPriceCents: number; currency: string } | null {
    if (!rooms.length) return null;

    let globalMin: number | null = null;
    let currency = rooms[0]?.currency ?? 'USD';

    for (const room of rooms) {
      if (stayNights?.length) {
        for (const night of stayNights) {
          const { priceCents } = this.resolveNightPrice(
            room,
            night,
            availabilityByRoomDate,
          );
          if (globalMin === null || priceCents < globalMin) {
            globalMin = priceCents;
            currency = room.currency;
          }
        }
      } else if (globalMin === null || room.basePriceCents < globalMin) {
        globalMin = room.basePriceCents;
        currency = room.currency;
      }
    }

    if (globalMin === null) return null;
    return { minPriceCents: globalMin, currency };
  }

  private async loadPropertyAmenities(
    propertyId: string,
  ): Promise<{ code: string; name: string }[]> {
    const links = await this.propertyAmenitiesRepository.find({
      where: { propertyId },
    });
    const activeLinks = links.filter((l) => !l.deletedAt);
    if (!activeLinks.length) return [];

    const amenityIds = [...new Set(activeLinks.map((l) => l.amenityId))];
    const amenities = await this.amenitiesRepository.find({
      where: { id: In(amenityIds) },
    });

    return amenities
      .filter((a) => !a.deletedAt)
      .map((a) => ({ code: a.code, name: a.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private async loadAmenityCodes(
    propertyIds: string[],
  ): Promise<Map<string, string[]>> {
    const links = await this.propertyAmenitiesRepository.find({
      where: { propertyId: In(propertyIds) },
    });
    const activeLinks = links.filter((l) => !l.deletedAt);
    if (!activeLinks.length) return new Map();

    const amenityIds = [...new Set(activeLinks.map((l) => l.amenityId))];
    const amenities = await this.amenitiesRepository.find({
      where: { id: In(amenityIds) },
    });
    const codeById = new Map(
      amenities
        .filter((a) => !a.deletedAt)
        .map((a) => [a.id, a.code] as const),
    );

    const result = new Map<string, string[]>();
    for (const link of activeLinks) {
      const code = codeById.get(link.amenityId);
      if (!code || !DISPLAY_AMENITY_CODES.has(code)) continue;
      const list = result.get(link.propertyId) ?? [];
      if (!list.includes(code)) list.push(code);
      result.set(link.propertyId, list);
    }
    return result;
  }
}
