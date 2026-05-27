import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Amenities,
  Destinations,
  Properties,
  PropertyAmenities,
  PropertyImages,
  RoomAvailability,
  Rooms,
} from '../../../entities/generated';
import { PropertySearchQueryDto } from './dto/property-search-query.dto';
import { PropertySearchResultDto } from './dto/property-search-result.dto';
import { PublicDestinationDto } from './dto/public-destination.dto';
import { enumerateStayNights } from './stay-dates.util';

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
    const availabilityByRoomDate = new Map<string, RoomAvailability>();

    if (stayNights?.length && roomIds.length) {
      const availabilityRows = await this.availabilityRepository
        .createQueryBuilder('ra')
        .where('ra.deletedAt IS NULL')
        .andWhere('ra.roomId IN (:...roomIds)', { roomIds })
        .andWhere('ra.date IN (:...dates)', { dates: stayNights })
        .getMany();

      for (const row of availabilityRows) {
        availabilityByRoomDate.set(`${row.roomId}:${row.date}`, row);
      }
    }

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

      const starRating =
        prop.starRating != null && prop.starRating !== ''
          ? Number.parseFloat(String(prop.starRating))
          : null;

      results.push({
        id: prop.id,
        slug: prop.slug,
        name: prop.name,
        propertyType: prop.propertyType,
        starRating: Number.isFinite(starRating) ? starRating : null,
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

  private computeMinNightlyPrice(
    rooms: Rooms[],
    stayNights: string[] | null,
    availabilityByRoomDate: Map<string, RoomAvailability>,
  ): { minPriceCents: number; currency: string } | null {
    let globalMin: number | null = null;
    let currency = rooms[0]?.currency ?? 'USD';

    for (const room of rooms) {
      if (stayNights?.length) {
        for (const night of stayNights) {
          const avail = availabilityByRoomDate.get(`${room.id}:${night}`);
          const nightPrice =
            avail && avail.availableUnits > 0
              ? avail.priceCents
              : room.basePriceCents;
          if (globalMin === null || nightPrice < globalMin) {
            globalMin = nightPrice;
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
