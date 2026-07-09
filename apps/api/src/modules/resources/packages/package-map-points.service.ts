import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Activities,
  ActivityItineraryStops,
  ActivityProviders,
  Airports,
  Destinations,
  Flights,
  Properties,
} from '../../../entities/generated';
import { PackageItemEnrichedDto, PackageMapPointDto } from './dto/package-detail.dto';

@Injectable()
export class PackageMapPointsService {
  constructor(
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(ActivityProviders)
    private readonly activityProvidersRepository: Repository<ActivityProviders>,
    @InjectRepository(ActivityItineraryStops)
    private readonly activityItineraryStopsRepository: Repository<ActivityItineraryStops>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
  ) {}

  async resolveForItems(items: PackageItemEnrichedDto[]): Promise<PackageMapPointDto[]> {
    const sortedItems = [...items].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const points: PackageMapPointDto[] = [];
    for (const item of sortedItems) {
      const itemPoints = await this.resolveItemPoints(item);
      points.push(...itemPoints);
    }
    return points;
  }

  private async resolveItemPoints(
    item: PackageItemEnrichedDto,
  ): Promise<PackageMapPointDto[]> {
    switch (item.itemType) {
      case 'activity':
        return this.resolveActivityPoints(item);
      case 'property':
        return this.resolvePropertyPoints(item);
      case 'flight':
        return this.resolveFlightPoints(item);
      case 'vehicle':
      case 'cruise':
        return [];
      default:
        return [];
    }
  }

  private async resolveActivityPoints(
    item: PackageItemEnrichedDto,
  ): Promise<PackageMapPointDto[]> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: item.itemId },
    });
    if (!activity || activity.deletedAt) {
      return [];
    }

    const stops = await this.activityItineraryStopsRepository.find({
      where: { activityId: activity.id },
      order: { stopOrder: 'ASC', createdAt: 'ASC' },
    });

    const activeStops = stops.filter((stop) => !stop.deletedAt);
    if (activeStops.length) {
      return activeStops.flatMap((stop) => {
        const latitude = this.toCoord(stop.latitude);
        const longitude = this.toCoord(stop.longitude);
        if (latitude === null || longitude === null) {
          return [];
        }

        return [
          this.toMapPoint({
            label: `${item.label} — ${stop.name}`,
            latitude,
            longitude,
            itemType: item.itemType,
            itemId: item.itemId,
            itemName: item.label,
          }),
        ];
      });
    }

    const provider = await this.activityProvidersRepository.findOne({
      where: { id: activity.providerId },
    });
    if (!provider || provider.deletedAt) {
      return [];
    }

    const destination = await this.destinationsRepository.findOne({
      where: { id: provider.destinationId },
    });
    if (!destination || destination.deletedAt) {
      return [];
    }

    const latitude = this.toCoord(destination.latitude);
    const longitude = this.toCoord(destination.longitude);
    if (latitude === null || longitude === null) {
      return [];
    }

    return [
      this.toMapPoint({
        label: destination.name,
        latitude,
        longitude,
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.label,
      }),
    ];
  }

  private async resolvePropertyPoints(
    item: PackageItemEnrichedDto,
  ): Promise<PackageMapPointDto[]> {
    const property = await this.propertiesRepository.findOne({
      where: { id: item.itemId },
    });
    if (!property || property.deletedAt) {
      return [];
    }

    const destination = await this.destinationsRepository.findOne({
      where: { id: property.destinationId },
    });
    if (!destination || destination.deletedAt) {
      return [];
    }

    const latitude = this.toCoord(destination.latitude);
    const longitude = this.toCoord(destination.longitude);
    if (latitude === null || longitude === null) {
      return [];
    }

    return [
      this.toMapPoint({
        label: property.name,
        latitude,
        longitude,
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.label,
      }),
    ];
  }

  private async resolveFlightPoints(
    item: PackageItemEnrichedDto,
  ): Promise<PackageMapPointDto[]> {
    const flight = await this.flightsRepository.findOne({
      where: { id: item.itemId },
    });
    if (!flight || flight.deletedAt) {
      return [];
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      this.airportsRepository.findOne({ where: { id: flight.departureAirportId } }),
      this.airportsRepository.findOne({ where: { id: flight.arrivalAirportId } }),
    ]);

    const points: PackageMapPointDto[] = [];

    if (departureAirport && !departureAirport.deletedAt) {
      const latitude = this.toCoord(departureAirport.latitude);
      const longitude = this.toCoord(departureAirport.longitude);
      if (latitude !== null && longitude !== null) {
        points.push(
          this.toMapPoint({
            label: departureAirport.name,
            latitude,
            longitude,
            itemType: item.itemType,
            itemId: item.itemId,
            itemName: item.label,
          }),
        );
      }
    }

    if (arrivalAirport && !arrivalAirport.deletedAt) {
      const latitude = this.toCoord(arrivalAirport.latitude);
      const longitude = this.toCoord(arrivalAirport.longitude);
      if (latitude !== null && longitude !== null) {
        points.push(
          this.toMapPoint({
            label: arrivalAirport.name,
            latitude,
            longitude,
            itemType: item.itemType,
            itemId: item.itemId,
            itemName: item.label,
          }),
        );
      }
    }

    return points;
  }

  private toMapPoint(input: PackageMapPointDto): PackageMapPointDto {
    return input;
  }

  private toCoord(value: string | null | undefined): number | null {
    if (value == null) {
      return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
}
