import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PublicSiteSearchHit } from '@africatourismgate/types';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Destinations,
  RentalAgencies,
  VehicleAvailability,
  VehicleCategories,
  VehicleImages,
  VehicleRoutes,
  Vehicles,
} from '../../../entities/generated';
import { PublicGalleryImageDto } from '../dto/public-gallery-image.dto';
import { PublicDestinationDto } from '../accommodations/dto/public-destination.dto';
import {
  VEHICLE_SITE_SEARCH_WEIGHTS,
  scoreSiteSearchTextMatch,
} from '../site-search/site-search-scoring';
import { VehicleDetailQueryDto } from './dto/vehicle-detail-query.dto';
import { VehicleDetailDto } from './dto/vehicle-detail.dto';
import { VehicleSearchQueryDto } from './dto/vehicle-search-query.dto';
import { VehicleSearchResultDto } from './dto/vehicle-search-result.dto';
import {
  assertValidTravelDate,
  dateOnlyFromDatetime,
  slotCoversTravelDate,
  todayDateOnly,
} from './vehicle-dates.util';

@Injectable()
export class PublicVehiclesService {
  constructor(
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(VehicleCategories)
    private readonly categoriesRepository: Repository<VehicleCategories>,
    @InjectRepository(VehicleImages)
    private readonly vehicleImagesRepository: Repository<VehicleImages>,
    @InjectRepository(VehicleRoutes)
    private readonly vehicleRoutesRepository: Repository<VehicleRoutes>,
    @InjectRepository(RentalAgencies)
    private readonly agenciesRepository: Repository<RentalAgencies>,
    @InjectRepository(VehicleAvailability)
    private readonly availabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {}

  /** Free-text cities that appear as départ or arrivée on active tronçons. */
  async listPickupLocations(): Promise<PublicDestinationDto[]> {
    const routes = await this.vehicleRoutesRepository
      .createQueryBuilder('route')
      .innerJoin(
        Vehicles,
        'v',
        'v.id = route.vehicleId AND v.deletedAt IS NULL',
      )
      .where('route.deletedAt IS NULL')
      .getMany();

    const names = new Set<string>();
    for (const route of routes) {
      const departure = route.departureCity?.trim();
      const arrival = route.arrivalCity?.trim();
      if (departure) names.add(departure);
      if (arrival) names.add(arrival);
    }

    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        id: name,
        name,
        countryCode: '',
        latitude: null,
        longitude: null,
      }));
  }

  async search(
    query: VehicleSearchQueryDto,
  ): Promise<PaginatedResult<VehicleSearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const travelDate = query.travelDate ?? query.pickupDate;
    assertValidTravelDate(travelDate);

    const departureLocation = (
      query.departureLocation ??
      query.pickupLocation ??
      ''
    ).trim();
    const arrivalLocation = (query.arrivalLocation ?? '').trim();

    const routesQb = this.vehicleRoutesRepository
      .createQueryBuilder('route')
      .innerJoin(Vehicles, 'vehicle', 'vehicle.id = route.vehicleId')
      .where('route.deletedAt IS NULL')
      .andWhere('vehicle.deletedAt IS NULL');

    if (departureLocation) {
      routesQb.andWhere('route.departureCity LIKE :departureLocation', {
        departureLocation: `%${departureLocation}%`,
      });
    }
    if (arrivalLocation) {
      routesQb.andWhere('route.arrivalCity LIKE :arrivalLocation', {
        arrivalLocation: `%${arrivalLocation}%`,
      });
    }

    const routes = await routesQb.orderBy('route.priceCents', 'ASC').getMany();
    if (!routes.length) {
      return this.emptyPage(page, limit);
    }

    const vehicleIds = [...new Set(routes.map((r) => r.vehicleId))];
    const vehicles = await this.vehiclesRepository.find({
      where: { id: In(vehicleIds) },
    });
    const vehicleById = new Map(
      vehicles.filter((v) => !v.deletedAt).map((v) => [v.id, v]),
    );

    const agencyIds = [
      ...new Set(
        [...vehicleById.values()].map((v) => v.agencyId).filter(Boolean),
      ),
    ];
    const agencies = agencyIds.length
      ? await this.agenciesRepository.find({ where: { id: In(agencyIds) } })
      : [];
    const agencyById = new Map(
      agencies.filter((a) => !a.deletedAt).map((a) => [a.id, a]),
    );

    const categoryIds = [
      ...new Set([...vehicleById.values()].map((v) => v.categoryId)),
    ];
    const categories = categoryIds.length
      ? await this.categoriesRepository.find({ where: { id: In(categoryIds) } })
      : [];
    const categoryById = new Map(
      categories.filter((c) => !c.deletedAt).map((c) => [c.id, c]),
    );

    const slotsQuery = this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.vehicleId IN (:...vehicleIds)', { vehicleIds })
      .andWhere('slot.status = :status', { status: 'available' })
      .andWhere('slot.deletedAt IS NULL');

    if (travelDate) {
      slotsQuery
        .andWhere('DATE(slot.startDatetime) <= :travelDate', { travelDate })
        .andWhere('DATE(slot.endDatetime) >= :travelDate', { travelDate });
    }

    const slots = await slotsQuery.orderBy('slot.startDatetime', 'ASC').getMany();
    // Browse (no date): prefer slots still covering today; otherwise keep the
    // latest available window so tronçons remain visible in the catalogue.
    const relevantSlots = travelDate
      ? slots
      : (() => {
          const today = todayDateOnly();
          const current = slots.filter(
            (slot) => dateOnlyFromDatetime(slot.endDatetime) >= today,
          );
          return current.length ? current : slots;
        })();
    const bestSlotByVehicleId = this.pickBestSlotPerVehicle(relevantSlots);

    const imageUrlByVehicleId = await this.loadPrimaryImageUrlByVehicleId(vehicleIds);
    const results: VehicleSearchResultDto[] = [];

    for (const route of routes) {
      const vehicle = vehicleById.get(route.vehicleId);
      if (!vehicle) continue;

      const agency = agencyById.get(vehicle.agencyId);
      if (!agency) continue;

      const category = categoryById.get(vehicle.categoryId);
      if (!category) continue;

      const slot = bestSlotByVehicleId.get(vehicle.id);
      if (!slot) continue;

      let resolvedTravelDate = travelDate;
      if (!resolvedTravelDate) {
        const slotStart = dateOnlyFromDatetime(slot.startDatetime);
        const slotEnd = dateOnlyFromDatetime(slot.endDatetime);
        const today = todayDateOnly();
        if (slotStart > today) {
          resolvedTravelDate = slotStart;
        } else if (slotEnd >= today) {
          resolvedTravelDate = today;
        } else {
          // Catalogue browse with an expired window: surface the tronçon using
          // the last day of the slot so designation + route remain visible.
          resolvedTravelDate = slotEnd;
        }
        if (
          !slotCoversTravelDate(
            slot.startDatetime,
            slot.endDatetime,
            resolvedTravelDate,
          )
        ) {
          continue;
        }
      }

      results.push({
        id: vehicle.id,
        routeId: route.id,
        licensePlate: vehicle.licensePlate,
        categoryName: category.name,
        exampleModel: category.exampleModel,
        agencyName: agency.name,
        agencyAddress: agency.address,
        departureCity: route.departureCity,
        arrivalCity: route.arrivalCity,
        priceCents: route.priceCents,
        totalPriceCents: route.priceCents,
        currency: route.currency,
        travelDate: resolvedTravelDate,
        availabilitySlotId: slot.id,
        imageUrl: imageUrlByVehicleId.get(vehicle.id) ?? null,
        pickupCity: route.departureCity,
        dailyPriceCents: route.priceCents,
        rentalDays: 1,
        pickupDate: resolvedTravelDate,
        returnDate: resolvedTravelDate,
      });
    }

    results.sort((a, b) => a.totalPriceCents - b.totalPriceCents);

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

  /**
   * Free-text catalogue search for site-search (no dates required).
   * Matches category, example model, destination and agency.
   */
  async searchCatalog(
    q: string,
    limit: number,
  ): Promise<PublicSiteSearchHit[]> {
    const term = q.trim().toLowerCase();
    if (!term || limit < 1) return [];

    const pattern = `%${term}%`;
    const fetchLimit = Math.min(Math.max(limit * 3, limit), 60);

    const vehicles = await this.vehiclesRepository
      .createQueryBuilder('v')
      .innerJoin(
        VehicleCategories,
        'cat',
        'cat.id = v.categoryId AND cat.deletedAt IS NULL',
      )
      .innerJoin(
        RentalAgencies,
        'ra',
        'ra.id = v.agencyId AND ra.deletedAt IS NULL',
      )
      .leftJoin(
        Destinations,
        'd',
        'd.id = ra.destinationId AND d.deletedAt IS NULL',
      )
      .where('v.deletedAt IS NULL')
      .andWhere(
        `(LOWER(cat.name) LIKE :pattern
          OR LOWER(COALESCE(cat.exampleModel, '')) LIKE :pattern
          OR LOWER(COALESCE(d.name, '')) LIKE :pattern
          OR LOWER(COALESCE(d.slug, '')) LIKE :pattern
          OR LOWER(ra.name) LIKE :pattern
          OR LOWER(COALESCE(v.licensePlate, '')) LIKE :pattern)`,
        { pattern },
      )
      .orderBy('cat.name', 'ASC')
      .take(fetchLimit)
      .getMany();

    if (!vehicles.length) return [];

    const categoryIds = [...new Set(vehicles.map((v) => v.categoryId))];
    const categories = await this.categoriesRepository.find({
      where: { id: In(categoryIds) },
    });
    const categoryById = new Map(
      categories.filter((c) => !c.deletedAt).map((c) => [c.id, c] as const),
    );

    const agencyIds = [...new Set(vehicles.map((v) => v.agencyId))];
    const agencies = await this.agenciesRepository.find({
      where: { id: In(agencyIds) },
    });
    const agencyById = new Map(
      agencies.filter((a) => !a.deletedAt).map((a) => [a.id, a] as const),
    );

    const destIds = [
      ...new Set(
        [...agencyById.values()]
          .map((a) => a.destinationId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const destinations =
      destIds.length > 0
        ? await this.destinationsRepository.find({ where: { id: In(destIds) } })
        : [];
    const destinationById = new Map(
      destinations.filter((d) => !d.deletedAt).map((d) => [d.id, d] as const),
    );

    const imageUrlByVehicleId = await this.loadPrimaryImageUrlByVehicleId(
      vehicles.map((v) => v.id),
    );

    const hits: PublicSiteSearchHit[] = [];

    for (const vehicle of vehicles) {
      const category = categoryById.get(vehicle.categoryId);
      const agency = agencyById.get(vehicle.agencyId);
      if (!category || !agency) continue;

      const dest = agency.destinationId
        ? destinationById.get(agency.destinationId)
        : undefined;

      const score = scoreSiteSearchTextMatch(term, [
        {
          weight: VEHICLE_SITE_SEARCH_WEIGHTS.model,
          value: category.exampleModel,
        },
        {
          weight: VEHICLE_SITE_SEARCH_WEIGHTS.category,
          value: category.name,
        },
        {
          weight: VEHICLE_SITE_SEARCH_WEIGHTS.destination,
          value: dest?.name,
        },
        {
          weight: VEHICLE_SITE_SEARCH_WEIGHTS.destination,
          value: dest?.slug,
        },
        { weight: VEHICLE_SITE_SEARCH_WEIGHTS.agency, value: agency.name },
        {
          weight: VEHICLE_SITE_SEARCH_WEIGHTS.licensePlate,
          value: vehicle.licensePlate,
        },
      ]);
      if (score <= 0) continue;

      const title =
        category.exampleModel?.trim() ||
        category.name ||
        vehicle.licensePlate ||
        'Vehicle';

      const subtitleParts = [
        category.exampleModel?.trim() ? category.name : null,
        dest ? `${dest.name} · ${dest.countryCode}` : agency.name,
      ].filter(Boolean);

      hits.push({
        type: 'cars',
        id: vehicle.id,
        title,
        subtitle: subtitleParts.join(' · ') || null,
        href: `/cars/${encodeURIComponent(vehicle.id)}`,
        imageUrl: imageUrlByVehicleId.get(vehicle.id) ?? null,
        score,
      });
    }

    hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return hits.slice(0, limit);
  }

  async getById(
    id: string,
    query: VehicleDetailQueryDto,
  ): Promise<VehicleDetailDto> {
    const travelDate = query.travelDate ?? query.pickupDate;
    if (!travelDate) {
      throw new BadRequestException('travelDate est requis.');
    }
    assertValidTravelDate(travelDate);

    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle || vehicle.deletedAt) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    const agency = await this.agenciesRepository.findOne({
      where: { id: vehicle.agencyId },
    });
    if (!agency || agency.deletedAt) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: vehicle.categoryId },
    });
    if (!category || category.deletedAt) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    const route = await this.resolveRouteForVehicle(vehicle.id, query);

    let city = '';
    if (agency.destinationId) {
      const agencyDestination = await this.destinationsRepository.findOne({
        where: { id: agency.destinationId },
      });
      if (agencyDestination && !agencyDestination.deletedAt) {
        city = agencyDestination.name;
      }
    }

    const slot = await this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.vehicleId = :vehicleId', { vehicleId: vehicle.id })
      .andWhere('slot.status = :status', { status: 'available' })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('DATE(slot.startDatetime) <= :travelDate', { travelDate })
      .andWhere('DATE(slot.endDatetime) >= :travelDate', { travelDate })
      .orderBy('slot.startDatetime', 'ASC')
      .getOne();

    const images = await this.loadVehicleGallery(vehicle.id);

    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      agency: {
        id: agency.id,
        name: agency.name,
        address: agency.address,
        city,
      },
      category: {
        id: category.id,
        name: category.name,
        exampleModel: category.exampleModel,
      },
      route: {
        id: route.id,
        departureCity: route.departureCity,
        arrivalCity: route.arrivalCity,
        priceCents: route.priceCents,
        currency: route.currency,
      },
      travelDate,
      priceCents: route.priceCents,
      totalPriceCents: route.priceCents,
      currency: route.currency,
      availabilitySlot: slot
        ? {
            id: slot.id,
            startDatetime: this.toIsoDatetime(slot.startDatetime),
            endDatetime: this.toIsoDatetime(slot.endDatetime),
          }
        : null,
      images,
      pickupDate: travelDate,
      returnDate: travelDate,
      rentalDays: 1,
      dailyPriceCents: route.priceCents,
    };
  }

  private async resolveRouteForVehicle(
    vehicleId: string,
    query: VehicleDetailQueryDto,
  ): Promise<VehicleRoutes> {
    if (query.routeId) {
      const route = await this.vehicleRoutesRepository.findOne({
        where: { id: query.routeId },
      });
      if (!route || route.deletedAt || route.vehicleId !== vehicleId) {
        throw new NotFoundException('Tronçon introuvable pour ce véhicule.');
      }
      return route;
    }

    const departureCity = query.departureCity?.trim();
    const arrivalCity = query.arrivalCity?.trim();
    if (departureCity && arrivalCity) {
      const route = await this.vehicleRoutesRepository
        .createQueryBuilder('route')
        .where('route.vehicleId = :vehicleId', { vehicleId })
        .andWhere('route.deletedAt IS NULL')
        .andWhere('LOWER(route.departureCity) = LOWER(:departureCity)', {
          departureCity,
        })
        .andWhere('LOWER(route.arrivalCity) = LOWER(:arrivalCity)', {
          arrivalCity,
        })
        .getOne();
      if (!route) {
        throw new NotFoundException(
          'Aucun tronçon pour ce couple départ / arrivée.',
        );
      }
      return route;
    }

    const fallback = await this.vehicleRoutesRepository
      .createQueryBuilder('route')
      .where('route.vehicleId = :vehicleId', { vehicleId })
      .andWhere('route.deletedAt IS NULL')
      .orderBy('route.priceCents', 'ASC')
      .getOne();
    if (!fallback) {
      throw new NotFoundException('Aucun tronçon tarifé pour ce véhicule.');
    }
    return fallback;
  }

  private async resolveEndpointDestinationIds(input: {
    destinationId?: string;
    locationName?: string;
  }): Promise<string[]> {
    if (input.destinationId) {
      return [input.destinationId];
    }
    const term = input.locationName?.trim();
    if (!term) {
      return [];
    }
    return this.resolveDestinationIds(term);
  }

  private async loadPrimaryImageUrlByVehicleId(
    vehicleIds: string[],
  ): Promise<Map<string, string>> {
    if (!vehicleIds.length) {
      return new Map();
    }

    const rows = await this.vehicleImagesRepository.find({
      where: { vehicleId: In(vehicleIds) },
      order: { sortOrder: 'ASC' },
    });
    const imageUrlByVehicleId = new Map<string, string>();
    for (const row of rows) {
      if (!row.deletedAt && !imageUrlByVehicleId.has(row.vehicleId)) {
        imageUrlByVehicleId.set(row.vehicleId, row.url);
      }
    }
    return imageUrlByVehicleId;
  }

  private async loadVehicleGallery(vehicleId: string): Promise<PublicGalleryImageDto[]> {
    const rows = await this.vehicleImagesRepository.find({
      where: { vehicleId },
      order: { sortOrder: 'ASC' },
    });
    return rows
      .filter((row) => !row.deletedAt)
      .map((row) => ({
        id: row.id,
        url: row.url,
        caption: row.caption ?? null,
        sortOrder: row.sortOrder,
      }));
  }

  private async resolveDestinationIds(locationName: string): Promise<string[]> {
    const term = locationName.trim();
    if (!term) {
      return [];
    }

    const rows = await this.destinationsRepository
      .createQueryBuilder('d')
      .select('d.id')
      .where('d.deletedAt IS NULL')
      .andWhere('LOWER(d.name) LIKE :pattern', {
        pattern: `%${term.toLowerCase()}%`,
      })
      .getMany();

    return rows.map((d) => d.id);
  }

  private pickBestSlotPerVehicle(
    slots: VehicleAvailability[],
  ): Map<string, VehicleAvailability> {
    const byVehicleId = new Map<string, VehicleAvailability>();

    for (const slot of slots) {
      const existing = byVehicleId.get(slot.vehicleId);
      if (!existing || this.slotSpanMs(slot) > this.slotSpanMs(existing)) {
        byVehicleId.set(slot.vehicleId, slot);
      }
    }

    return byVehicleId;
  }

  private slotSpanMs(slot: VehicleAvailability): number {
    return (
      this.toDate(slot.endDatetime).getTime() -
      this.toDate(slot.startDatetime).getTime()
    );
  }

  private toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private toCoord(value: string | null | undefined): number | null {
    if (value == null) {
      return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private toIsoDatetime(value: Date | string): string {
    return this.toDate(value).toISOString();
  }

  private emptyPage(page: number, limit: number): PaginatedResult<VehicleSearchResultDto> {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 1 },
    };
  }
}
