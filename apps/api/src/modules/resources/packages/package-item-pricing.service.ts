import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Activities,
  Cabins,
  FlightClasses,
  Flights,
  PackageItems,
  Properties,
  Rooms,
  Vehicles,
} from '../../../entities/generated';
import { PackageItemEnrichedDto, PackagePricingDto } from './dto/package-detail.dto';

export type ResolvedItemPrice = {
  label: string;
  unitPriceCents: number;
  currency: string;
};

@Injectable()
export class PackageItemPricingService {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
  ) {}

  async assertReferencedItemExists(
    itemType: PackageItems['itemType'],
    itemId: string,
  ): Promise<void> {
    await this.resolveItemPrice(itemType, itemId);
  }

  async resolveItemPrice(
    itemType: PackageItems['itemType'],
    itemId: string,
  ): Promise<ResolvedItemPrice> {
    switch (itemType) {
      case 'property':
        return this.resolvePropertyPrice(itemId);
      case 'flight':
        return this.resolveFlightPrice(itemId);
      case 'vehicle':
        return this.resolveVehiclePrice(itemId);
      case 'cruise':
        return this.resolveCruisePrice(itemId);
      case 'activity':
        return this.resolveActivityPrice(itemId);
      default:
        throw new BadRequestException('Type d’item non supporté.');
    }
  }

  enrichItem(row: PackageItems): Promise<PackageItemEnrichedDto> {
    return this.resolveItemPrice(row.itemType, row.itemId).then((resolved) => ({
      id: row.id,
      packageId: row.packageId,
      itemType: row.itemType,
      itemId: row.itemId,
      label: resolved.label,
      unitPriceCents: resolved.unitPriceCents,
      currency: resolved.currency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  computePricing(
    items: PackageItemEnrichedDto[],
    discountPercent: number,
  ): PackagePricingDto {
    if (items.length === 0) {
      return {
        subtotalCents: 0,
        discountPercent,
        discountAmountCents: 0,
        totalCents: 0,
        currency: 'USD',
      };
    }

    const currencies = new Set(items.map((i) => i.currency));
    if (currencies.size > 1) {
      throw new BadRequestException(
        'Les items du forfait doivent utiliser la même devise.',
      );
    }

    const currency = items[0].currency;
    const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents, 0);
    const discountAmountCents = Math.round((subtotalCents * discountPercent) / 100);
    const totalCents = subtotalCents - discountAmountCents;

    return {
      subtotalCents,
      discountPercent,
      discountAmountCents,
      totalCents,
      currency,
    };
  }

  private async resolvePropertyPrice(propertyId: string): Promise<ResolvedItemPrice> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });
    if (!property || property.deletedAt) {
      throw new NotFoundException('Propriété introuvable.');
    }

    const row = await this.roomsRepository
      .createQueryBuilder('room')
      .select('MIN(room.basePriceCents)', 'minPrice')
      .addSelect('MIN(room.currency)', 'currency')
      .where('room.propertyId = :propertyId', { propertyId })
      .andWhere('room.deletedAt IS NULL')
      .getRawOne<{ minPrice: string | null; currency: string | null }>();

    const minPrice = row?.minPrice != null ? Number(row.minPrice) : NaN;
    if (!Number.isFinite(minPrice)) {
      throw new NotFoundException('Aucune chambre tarifée pour cette propriété.');
    }

    return {
      label: property.name,
      unitPriceCents: minPrice,
      currency: row?.currency ?? 'USD',
    };
  }

  private async resolveFlightPrice(flightId: string): Promise<ResolvedItemPrice> {
    const flight = await this.flightsRepository.findOne({ where: { id: flightId } });
    if (!flight || flight.deletedAt) {
      throw new NotFoundException('Vol introuvable.');
    }

    const row = await this.flightClassesRepository
      .createQueryBuilder('fc')
      .select('MIN(fc.basePriceCents)', 'minPrice')
      .where('fc.flightId = :flightId', { flightId })
      .andWhere('fc.deletedAt IS NULL')
      .getRawOne<{ minPrice: string | null }>();

    const minPrice = row?.minPrice != null ? Number(row.minPrice) : NaN;
    if (!Number.isFinite(minPrice)) {
      throw new NotFoundException('Aucune classe tarifée pour ce vol.');
    }

    return {
      label: `Vol ${flight.flightNumber}`,
      unitPriceCents: minPrice,
      currency: 'USD',
    };
  }

  private async resolveVehiclePrice(vehicleId: string): Promise<ResolvedItemPrice> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle || vehicle.deletedAt) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    return {
      label: vehicle.licensePlate?.trim() || `Véhicule ${vehicle.id.slice(0, 8)}`,
      unitPriceCents: vehicle.dailyPriceCents,
      currency: vehicle.currency,
    };
  }

  private async resolveCruisePrice(cabinId: string): Promise<ResolvedItemPrice> {
    const cabin = await this.cabinsRepository.findOne({ where: { id: cabinId } });
    if (!cabin || cabin.deletedAt) {
      throw new NotFoundException('Cabine introuvable.');
    }

    return {
      label: cabin.categoryName,
      unitPriceCents: cabin.basePriceCents,
      currency: cabin.currency,
    };
  }

  private async resolveActivityPrice(activityId: string): Promise<ResolvedItemPrice> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId },
    });
    if (!activity || activity.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }

    return {
      label: activity.title,
      unitPriceCents: activity.priceCents,
      currency: activity.currency,
    };
  }
}
