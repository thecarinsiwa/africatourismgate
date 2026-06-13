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
import { PackagesService } from '../packages/packages.service';
import { BookingCheckoutItemDto } from './dto/booking-checkout.dto';

export type AppliedPackageCheckoutDiscount = {
  packageId: string;
  name: string;
  discountPercent: number;
  discountCents: number;
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

  computeDiscountCents(subtotalCents: number, discountPercent: number): number {
    return Math.round((subtotalCents * discountPercent) / 100);
  }

  private catalogKey(
    itemType: 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity',
    itemId: string,
  ): string {
    return `${itemType}:${itemId}`;
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
