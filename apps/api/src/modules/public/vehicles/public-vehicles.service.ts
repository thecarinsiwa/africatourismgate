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
import { VehicleDetailQueryDto } from './dto/vehicle-detail-query.dto';
import { VehicleDetailDto } from './dto/vehicle-detail.dto';
import { VehicleSearchQueryDto } from './dto/vehicle-search-query.dto';
import { VehicleSearchResultDto } from './dto/vehicle-search-result.dto';
import {
  assertValidVehicleDates,
  countRentalDays,
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

  async search(
    query: VehicleSearchQueryDto,
  ): Promise<PaginatedResult<VehicleSearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    assertValidVehicleDates(query.pickupDate, query.returnDate);
    const rentalDays = countRentalDays(query.pickupDate, query.returnDate);

    const destinationIds = await this.resolveDestinationIds(query.pickupLocation);
    if (!destinationIds.length) {
      return this.emptyPage(page, limit);
    }

    const agencies = await this.agenciesRepository.find({
      where: { destinationId: In(destinationIds) },
    });
    const activeAgencies = agencies.filter((a) => !a.deletedAt);
    if (!activeAgencies.length) {
      return this.emptyPage(page, limit);
    }

    const agencyById = new Map(activeAgencies.map((a) => [a.id, a]));
    const agencyIds = activeAgencies.map((a) => a.id);

    const vehicles = await this.vehiclesRepository.find({
      where: { agencyId: In(agencyIds) },
    });
    const activeVehicles = vehicles.filter((v) => !v.deletedAt);
    if (!activeVehicles.length) {
      return this.emptyPage(page, limit);
    }

    const vehicleIds = activeVehicles.map((v) => v.id);
    const slots = await this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.vehicleId IN (:...vehicleIds)', { vehicleIds })
      .andWhere('slot.status = :status', { status: 'available' })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('DATE(slot.startDatetime) <= :pickupDate', {
        pickupDate: query.pickupDate,
      })
      .andWhere('DATE(slot.endDatetime) >= :returnDate', {
        returnDate: query.returnDate,
      })
      .orderBy('slot.startDatetime', 'ASC')
      .getMany();

    const slotByVehicleId = this.pickBestSlotPerVehicle(slots);
    if (!slotByVehicleId.size) {
      return this.emptyPage(page, limit);
    }

    const categoryIds = [...new Set(activeVehicles.map((v) => v.categoryId))];
    const categories = await this.categoriesRepository.find({
      where: { id: In(categoryIds) },
    });
    const categoryById = new Map(
      categories.filter((c) => !c.deletedAt).map((c) => [c.id, c]),
    );

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

    const results: VehicleSearchResultDto[] = [];

    for (const vehicle of activeVehicles) {
      const slot = slotByVehicleId.get(vehicle.id);
      if (!slot) continue;

      const agency = agencyById.get(vehicle.agencyId);
      if (!agency) continue;

      const category = categoryById.get(vehicle.categoryId);
      if (!category) continue;

      const pickupCity =
        (agency.destinationId && cityByDestId.get(agency.destinationId)) ||
        query.pickupLocation.trim();

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
