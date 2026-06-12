import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Destinations,
  RentalAgencies,
  VehicleAvailability,
  VehicleCategories,
  Vehicles,
} from '../../../entities/generated';
import { PublicDestinationDto } from '../accommodations/dto/public-destination.dto';
import { VehicleDetailQueryDto } from './dto/vehicle-detail-query.dto';
import { VehicleDetailDto } from './dto/vehicle-detail.dto';
import { VehicleSearchQueryDto } from './dto/vehicle-search-query.dto';
import { VehicleSearchResultDto } from './dto/vehicle-search-result.dto';
import {
  assertValidVehicleDates,
  countRentalDays,
  resolveDefaultRentalWindow,
  todayDateOnly,
} from './vehicle-dates.util';

@Injectable()
export class PublicVehiclesService {
  constructor(
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(VehicleCategories)
    private readonly categoriesRepository: Repository<VehicleCategories>,
    @InjectRepository(RentalAgencies)
    private readonly agenciesRepository: Repository<RentalAgencies>,
    @InjectRepository(VehicleAvailability)
    private readonly availabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {}

  async listPickupLocations(): Promise<PublicDestinationDto[]> {
    const rows = await this.destinationsRepository
      .createQueryBuilder('d')
      .select(['d.id', 'd.name', 'd.countryCode'])
      .innerJoin(
        RentalAgencies,
        'ra',
        'ra.destinationId = d.id AND ra.deletedAt IS NULL',
      )
      .innerJoin(
        Vehicles,
        'v',
        'v.agencyId = ra.id AND v.deletedAt IS NULL',
      )
      .where('d.deletedAt IS NULL')
      .distinct(true)
      .orderBy('d.name', 'ASC')
      .getMany();

    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      countryCode: d.countryCode,
    }));
  }

  async search(
    query: VehicleSearchQueryDto,
  ): Promise<PaginatedResult<VehicleSearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const hasDates = Boolean(query.pickupDate && query.returnDate);

    assertValidVehicleDates(query.pickupDate, query.returnDate);

    const fleet = await this.resolveActiveFleet(query.pickupLocation);
    if (!fleet) {
      return this.emptyPage(page, limit);
    }

    const { activeVehicles, agencyById, cityByDestId } = fleet;
    const vehicleIds = activeVehicles.map((v) => v.id);

    const slotsQuery = this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.vehicleId IN (:...vehicleIds)', { vehicleIds })
      .andWhere('slot.status = :status', { status: 'available' })
      .andWhere('slot.deletedAt IS NULL');

    if (hasDates) {
      slotsQuery
        .andWhere('DATE(slot.startDatetime) <= :pickupDate', {
          pickupDate: query.pickupDate,
        })
        .andWhere('DATE(slot.endDatetime) >= :returnDate', {
          returnDate: query.returnDate,
        });
    } else {
      slotsQuery.andWhere('DATE(slot.endDatetime) >= :today', {
        today: todayDateOnly(),
      });
    }

    const slots = await slotsQuery.orderBy('slot.startDatetime', 'ASC').getMany();

    const categoryIds = [...new Set(activeVehicles.map((v) => v.categoryId))];
    const categories = await this.categoriesRepository.find({
      where: { id: In(categoryIds) },
    });
    const categoryById = new Map(
      categories.filter((c) => !c.deletedAt).map((c) => [c.id, c]),
    );

    const results: VehicleSearchResultDto[] = [];

    for (const vehicle of activeVehicles) {
      const vehicleSlots = slots.filter((slot) => slot.vehicleId === vehicle.id);
      if (!vehicleSlots.length) continue;

      const agency = agencyById.get(vehicle.agencyId);
      if (!agency) continue;

      const category = categoryById.get(vehicle.categoryId);
      if (!category) continue;

      let slot: VehicleAvailability;
      let pickupDate: string;
      let returnDate: string;

      if (hasDates) {
        const bestSlot = this.pickBestSlotPerVehicle(vehicleSlots).get(vehicle.id);
        if (!bestSlot) continue;
        slot = bestSlot;
        pickupDate = query.pickupDate!;
        returnDate = query.returnDate!;
      } else {
        slot = vehicleSlots[0];
        const window = resolveDefaultRentalWindow(
          slot.startDatetime,
          slot.endDatetime,
        );
        if (!window) continue;
        pickupDate = window.pickupDate;
        returnDate = window.returnDate;
      }

      const rentalDays = countRentalDays(pickupDate, returnDate);
      const pickupCity =
        (agency.destinationId && cityByDestId.get(agency.destinationId)) ||
        query.pickupLocation?.trim() ||
        '';

      results.push({
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        categoryName: category.name,
        exampleModel: category.exampleModel,
        agencyName: agency.name,
        agencyAddress: agency.address,
        pickupCity,
        dailyPriceCents: vehicle.dailyPriceCents,
        totalPriceCents: vehicle.dailyPriceCents * rentalDays,
        currency: vehicle.currency,
        rentalDays,
        pickupDate,
        returnDate,
        availabilitySlotId: slot.id,
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

  private async resolveActiveFleet(pickupLocation?: string): Promise<{
    activeVehicles: Vehicles[];
    agencyById: Map<string, RentalAgencies>;
    cityByDestId: Map<string, string>;
  } | null> {
    let activeAgencies: RentalAgencies[];

    const locationTerm = pickupLocation?.trim();
    if (locationTerm) {
      const destinationIds = await this.resolveDestinationIds(locationTerm);
      if (!destinationIds.length) {
        return null;
      }

      const agencies = await this.agenciesRepository.find({
        where: { destinationId: In(destinationIds) },
      });
      activeAgencies = agencies.filter((a) => !a.deletedAt);
    } else {
      const agencies = await this.agenciesRepository.find();
      activeAgencies = agencies.filter((a) => !a.deletedAt);
    }

    if (!activeAgencies.length) {
      return null;
    }

    const agencyById = new Map(activeAgencies.map((a) => [a.id, a]));
    const agencyIds = activeAgencies.map((a) => a.id);

    const vehicles = await this.vehiclesRepository.find({
      where: { agencyId: In(agencyIds) },
    });
    const activeVehicles = vehicles.filter((v) => !v.deletedAt);
    if (!activeVehicles.length) {
      return null;
    }

    const destIds = [
      ...new Set(
        activeAgencies
          .map((a) => a.destinationId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const destinations =
      destIds.length > 0
        ? await this.destinationsRepository.find({ where: { id: In(destIds) } })
        : [];
    const cityByDestId = new Map(
      destinations.filter((d) => !d.deletedAt).map((d) => [d.id, d.name]),
    );

    return { activeVehicles, agencyById, cityByDestId };
  }

  async getById(
    id: string,
    query: VehicleDetailQueryDto,
  ): Promise<VehicleDetailDto> {
    assertValidVehicleDates(query.pickupDate, query.returnDate);
    const rentalDays = countRentalDays(query.pickupDate, query.returnDate);

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

    let city = '';
    if (agency.destinationId) {
      const destination = await this.destinationsRepository.findOne({
        where: { id: agency.destinationId },
      });
      if (destination && !destination.deletedAt) {
        city = destination.name;
      }
    }

    const slot = await this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.vehicleId = :vehicleId', { vehicleId: vehicle.id })
      .andWhere('slot.status = :status', { status: 'available' })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('DATE(slot.startDatetime) <= :pickupDate', {
        pickupDate: query.pickupDate,
      })
      .andWhere('DATE(slot.endDatetime) >= :returnDate', {
        returnDate: query.returnDate,
      })
      .orderBy('slot.startDatetime', 'ASC')
      .getOne();

    if (!slot) {
      throw new NotFoundException(
        'Aucun créneau disponible pour cette période.',
      );
    }

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
      pickupDate: query.pickupDate,
      returnDate: query.returnDate,
      rentalDays,
      dailyPriceCents: vehicle.dailyPriceCents,
      totalPriceCents: vehicle.dailyPriceCents * rentalDays,
      currency: vehicle.currency,
      availabilitySlot: {
        id: slot.id,
        startDatetime: this.toIsoDatetime(slot.startDatetime),
        endDatetime: this.toIsoDatetime(slot.endDatetime),
      },
    };
  }

  private async resolveDestinationIds(pickupLocation: string): Promise<string[]> {
    const term = pickupLocation.trim();
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
