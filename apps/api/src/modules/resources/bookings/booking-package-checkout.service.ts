import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivitySchedules,
  CabinAvailability,
  Cabins,
  FlightClasses,
  Rooms,
  VehicleAvailability,
} from '../../../entities/generated';
import { PackageItemEnrichedDto } from '../packages/dto/package-detail.dto';
import { PackagesService } from '../packages/packages.service';
import { BookingCheckoutItemDto } from './dto/booking-checkout.dto';
import type { PackageResolvedLineDto } from '../../public/packages/dto/package-resolved-line.dto';

export type AppliedPackageCheckoutDiscount = {
  packageId: string;
  name: string;
  discountPercent: number;
  discountCents: number;
};

export type PackageApprovalQuery = {
  startDate: string;
  endDate: string;
  travelers: number;
};

@Injectable()
export class BookingPackageCheckoutService {
  constructor(
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
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
  ) {}

  async resolvePackageDiscount(
    packageId: string,
    checkoutItems: BookingCheckoutItemDto[],
    subtotalCents: number,
  ): Promise<AppliedPackageCheckoutDiscount> {
    const detail = await this.packagesService.findOneDetail(packageId);
    const pkg = detail.package;

    if (pkg.deletedAt || pkg.active !== 1) {
      throw new NotFoundException('Forfait introuvable.');
    }

    if (detail.items.length === 0) {
      throw new BadRequestException('Ce forfait ne contient aucun item.');
    }

    if (
      checkoutItems.length === 1 &&
      checkoutItems[0]?.itemType === 'package' &&
      checkoutItems[0].referenceId === packageId
    ) {
      const travelers = checkoutItems[0].quantity;
      const discountPercent = Number(pkg.discountPercent);
      const discountCents = detail.pricing.discountAmountCents * travelers;

      return {
        packageId: pkg.id,
        name: pkg.name,
        discountPercent,
        discountCents,
      };
    }

    const expectedKeys = detail.items
      .map((item) => this.catalogKey(item.itemType, item.itemId))
      .sort();
    const checkoutKeys = (
      await Promise.all(
        checkoutItems.map((item) => this.resolveCheckoutCatalogKey(item)),
      )
    ).sort();

    if (expectedKeys.length !== checkoutKeys.length) {
      throw new BadRequestException(
        'Les items du panier ne correspondent pas au forfait.',
      );
    }

    for (let i = 0; i < expectedKeys.length; i += 1) {
      if (expectedKeys[i] !== checkoutKeys[i]) {
        throw new BadRequestException(
          'Les items du panier ne correspondent pas au forfait.',
        );
      }
    }

    const discountPercent = Number(pkg.discountPercent);
    const discountCents = Math.round((subtotalCents * discountPercent) / 100);

    return {
      packageId: pkg.id,
      name: pkg.name,
      discountPercent,
      discountCents,
    };
  }

  async resolvePackageLinesForApproval(
    packageId: string,
    query: PackageApprovalQuery,
  ): Promise<PackageResolvedLineDto[]> {
    const detail = await this.packagesService.findOneDetail(packageId);
    const pkg = detail.package;

    if (pkg.deletedAt || pkg.active !== 1) {
      throw new NotFoundException('Forfait introuvable.');
    }

    const lines: PackageResolvedLineDto[] = [];

    for (const item of detail.items) {
      const line = await this.resolveCatalogLineForApproval(item, query);
      if (!line) {
        throw new BadRequestException(
          `Créez d'abord des créneaux pour la date demandée (${query.startDate}) — prestation : ${item.label}.`,
        );
      }
      lines.push(line);
    }

    return lines;
  }

  computeDiscountCents(subtotalCents: number, discountPercent: number): number {
    return Math.round((subtotalCents * discountPercent) / 100);
  }

  async resolveAssistedPackageLine(item: BookingCheckoutItemDto): Promise<{
    itemType: 'package';
    referenceId: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    titleSnapshot: string;
    currency: string;
    startDate: string;
    endDate: string;
  }> {
    if (!item.startDate || !item.endDate) {
      throw new BadRequestException(
        'startDate et endDate sont requis pour un forfait assisté.',
      );
    }

    const detail = await this.packagesService.findOneDetail(item.referenceId);
    const pkg = detail.package;

    if (pkg.deletedAt || pkg.active !== 1) {
      throw new NotFoundException('Forfait introuvable.');
    }

    const travelers = item.quantity;
    const perTravelerSubtotal = detail.pricing.subtotalCents;

    return {
      itemType: 'package',
      referenceId: pkg.id,
      quantity: travelers,
      unitPriceCents: perTravelerSubtotal,
      lineTotalCents: perTravelerSubtotal * travelers,
      titleSnapshot: pkg.name,
      currency: detail.pricing.currency,
      startDate: item.startDate,
      endDate: item.endDate,
    };
  }

  private catalogKey(
    itemType: 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity',
    itemId: string,
  ): string {
    return `${itemType}:${itemId}`;
  }

  private async resolveCatalogLineForApproval(
    item: PackageItemEnrichedDto,
    query: PackageApprovalQuery,
  ): Promise<PackageResolvedLineDto | null> {
    switch (item.itemType) {
      case 'activity':
        return this.resolveActivityLineForApproval(item.itemId, query);
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

  private async resolveActivityLineForApproval(
    activityId: string,
    query: PackageApprovalQuery,
  ): Promise<PackageResolvedLineDto | null> {
    const schedules = await this.activitySchedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.activityId = :activityId', { activityId })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('DATE(schedule.startDatetime) = :date', { date: query.startDate })
      .orderBy('schedule.startDatetime', 'ASC')
      .getMany();

    const schedule = schedules.find(
      (row) => row.capacity - row.bookedCount >= query.travelers,
    );

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
    query: PackageApprovalQuery,
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
    query: PackageApprovalQuery,
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
    query: PackageApprovalQuery,
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
    query: PackageApprovalQuery,
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

  private async resolveCheckoutCatalogKey(
    item: BookingCheckoutItemDto,
  ): Promise<string> {
    switch (item.itemType) {
      case 'activity_schedule': {
        const schedule = await this.activitySchedulesRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!schedule || schedule.deletedAt) {
          throw new NotFoundException(
            `Créneau activité introuvable : ${item.referenceId}.`,
          );
        }
        return this.catalogKey('activity', schedule.activityId);
      }
      case 'room': {
        const room = await this.roomsRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!room || room.deletedAt) {
          throw new NotFoundException(`Chambre introuvable : ${item.referenceId}.`);
        }
        return this.catalogKey('property', room.propertyId);
      }
      case 'flight_class': {
        const flightClass = await this.flightClassesRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!flightClass || flightClass.deletedAt) {
          throw new NotFoundException(
            `Classe de vol introuvable : ${item.referenceId}.`,
          );
        }
        return this.catalogKey('flight', flightClass.flightId);
      }
      case 'vehicle': {
        const slot = await this.vehicleAvailabilityRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!slot || slot.deletedAt) {
          throw new NotFoundException(
            `Créneau véhicule introuvable : ${item.referenceId}.`,
          );
        }
        return this.catalogKey('vehicle', slot.vehicleId);
      }
      case 'cabin': {
        const availability = await this.cabinAvailabilityRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!availability || availability.deletedAt) {
          throw new NotFoundException(
            `Disponibilité cabine introuvable : ${item.referenceId}.`,
          );
        }
        const cabin = await this.cabinsRepository.findOne({
          where: { id: availability.cabinId },
        });
        if (!cabin || cabin.deletedAt) {
          throw new NotFoundException('Cabine introuvable.');
        }
        return this.catalogKey('cruise', cabin.id);
      }
      default:
        throw new BadRequestException('Type d’item non supporté.');
    }
  }
}
