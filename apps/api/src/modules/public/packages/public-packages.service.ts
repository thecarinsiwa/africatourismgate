import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  ActivitySchedules,
  CabinAvailability,
  FlightClasses,
  Packages,
  Rooms,
  VehicleAvailability,
} from '../../../entities/generated';
import { PackageDetailDto, PackageItemEnrichedDto } from '../../resources/packages/dto/package-detail.dto';
import { PackagesService } from '../../resources/packages/packages.service';
import { PublicPackageListItemDto } from './dto/public-package-list-item.dto';
import { PublicPackagesListQueryDto } from './dto/public-packages-list-query.dto';
import { PackageResolveLinesQueryDto } from './dto/package-resolve-lines-query.dto';
import { PackageResolvedLineDto } from './dto/package-resolved-line.dto';

@Injectable()
export class PublicPackagesService {
  constructor(
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
    private readonly packagesService: PackagesService,
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(VehicleAvailability)
    private readonly vehicleAvailabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(CabinAvailability)
    private readonly cabinAvailabilityRepository: Repository<CabinAvailability>,
  ) {}

  async list(
    query: PublicPackagesListQueryDto,
  ): Promise<PaginatedResult<PublicPackageListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.packagesRepository
      .createQueryBuilder('pkg')
      .where('pkg.deletedAt IS NULL')
      .andWhere('pkg.active = 1');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('pkg.name LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('pkg.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [packages, total] = await qb.getManyAndCount();

    const imageUrlByPackageId = await this.packagesService.findPrimaryImageUrlsByPackageIds(
      packages.map((pkg) => pkg.id),
    );

    const data = await Promise.all(
      packages.map(async (pkg) => this.toListItem(pkg, imageUrlByPackageId)),
    );

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

  async getById(id: string): Promise<PackageDetailDto> {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg || pkg.deletedAt || pkg.active !== 1) {
      throw new NotFoundException('Forfait introuvable.');
    }
    return this.packagesService.findOneDetail(id);
  }

  async resolveLines(
    id: string,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto[]> {
    const detail = await this.getById(id);
    const lines: PackageResolvedLineDto[] = [];

    for (const item of detail.items) {
      const line = await this.resolveCatalogLine(item, query);
      if (line) lines.push(line);
    }

    return lines;
  }

  private async resolveCatalogLine(
    item: PackageItemEnrichedDto,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto | null> {
    switch (item.itemType) {
      case 'activity':
        return this.resolveActivityLine(item.itemId, query);
      case 'property':
        return this.resolvePropertyLine(item.itemId, query);
      case 'flight':
        return this.resolveFlightLine(item.itemId, query);
      case 'vehicle':
        return this.resolveVehicleLine(item.itemId, query);
      case 'cruise':
        return this.resolveCruiseLine(item.itemId, query);
      default:
        return null;
    }
  }

  private async resolveActivityLine(
    activityId: string,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto | null> {
    let schedule = await this.activitySchedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.activityId = :activityId', { activityId })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('DATE(schedule.startDatetime) = :date', { date: query.startDate })
      .orderBy('schedule.startDatetime', 'ASC')
      .getOne();

    if (!schedule) {
      schedule = await this.activitySchedulesRepository
        .createQueryBuilder('schedule')
        .where('schedule.activityId = :activityId', { activityId })
        .andWhere('schedule.deletedAt IS NULL')
        .orderBy('schedule.startDatetime', 'ASC')
        .getOne();
    }

    if (!schedule) return null;

    return {
      lineType: 'activity',
      itemId: activityId,
      scheduleId: schedule.id,
      date: query.startDate,
      participants: query.travelers,
    };
  }

  private async resolvePropertyLine(
    propertyId: string,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto | null> {
    const room = await this.roomsRepository
      .createQueryBuilder('room')
      .where('room.propertyId = :propertyId', { propertyId })
      .andWhere('room.deletedAt IS NULL')
      .orderBy('room.basePriceCents', 'ASC')
      .getOne();

    if (!room) return null;

    return {
      lineType: 'property',
      itemId: propertyId,
      roomId: room.id,
      checkIn: query.startDate,
      checkOut: query.endDate,
      guests: query.travelers,
    };
  }

  private async resolveFlightLine(
    flightId: string,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto | null> {
    const flightClass = await this.flightClassesRepository
      .createQueryBuilder('flightClass')
      .where('flightClass.flightId = :flightId', { flightId })
      .andWhere('flightClass.deletedAt IS NULL')
      .orderBy('flightClass.priceCents', 'ASC')
      .getOne();

    if (!flightClass) return null;

    return {
      lineType: 'flight',
      itemId: flightId,
      flightClassId: flightClass.id,
      departureDate: query.startDate,
      passengers: query.travelers,
    };
  }

  private async resolveVehicleLine(
    vehicleId: string,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto | null> {
    let slot = await this.vehicleAvailabilityRepository
      .createQueryBuilder('slot')
      .where('slot.vehicleId = :vehicleId', { vehicleId })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('DATE(slot.startDatetime) <= :pickupDate', { pickupDate: query.startDate })
      .andWhere('DATE(slot.endDatetime) >= :returnDate', { returnDate: query.endDate })
      .orderBy('slot.startDatetime', 'ASC')
      .getOne();

    if (!slot) {
      slot = await this.vehicleAvailabilityRepository
        .createQueryBuilder('slot')
        .where('slot.vehicleId = :vehicleId', { vehicleId })
        .andWhere('slot.deletedAt IS NULL')
        .orderBy('slot.startDatetime', 'ASC')
        .getOne();
    }

    if (!slot) return null;

    return {
      lineType: 'vehicle',
      itemId: vehicleId,
      availabilitySlotId: slot.id,
      pickupDate: query.startDate,
      returnDate: query.endDate,
    };
  }

  private async resolveCruiseLine(
    cabinId: string,
    query: PackageResolveLinesQueryDto,
  ): Promise<PackageResolvedLineDto | null> {
    const availability = await this.cabinAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.cabinId = :cabinId', { cabinId })
      .andWhere('availability.deletedAt IS NULL')
      .orderBy('availability.createdAt', 'ASC')
      .getOne();

    if (!availability) return null;

    return {
      lineType: 'cruise',
      itemId: cabinId,
      sailingId: availability.sailingId,
      cabinAvailabilityId: availability.id,
      guests: query.travelers,
    };
  }

  private async toListItem(
    pkg: Packages,
    imageUrlByPackageId: Map<string, string>,
  ): Promise<PublicPackageListItemDto> {
    const detail = await this.packagesService.findOneDetail(pkg.id);
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      discountPercent: Number(pkg.discountPercent),
      itemCount: detail.items.length,
      pricing: detail.pricing,
      imageUrl: imageUrlByPackageId.get(pkg.id) ?? null,
    };
  }
}
