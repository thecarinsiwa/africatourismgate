import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  ActivitySchedules,
  CabinAvailability,
  FlightClasses,
  Rooms,
  VehicleAvailability,
} from '../../../entities/generated';

type CatalogRef = {
  itemType: string;
  referenceId: string;
};

function catalogKey(itemType: string, referenceId: string): string {
  return `${itemType}:${referenceId}`;
}

/**
 * Resolves the parent catalogue product id for booking lines so the admin UI
 * can deep-link to product detail pages (`/voir`, etc.).
 *
 * - room → propertyId
 * - flight_class → flightId
 * - vehicle → vehicleId (via availability row)
 * - cabin → sailingId (via availability row)
 * - activity_schedule → activityId
 * - package → referenceId (package id)
 */
@Injectable()
export class BookingItemCatalogService {
  constructor(
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(VehicleAvailability)
    private readonly vehicleAvailabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(CabinAvailability)
    private readonly cabinAvailabilityRepository: Repository<CabinAvailability>,
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
  ) {}

  async resolveProductIds(items: CatalogRef[]): Promise<Map<string, string | null>> {
    const result = new Map<string, string | null>();
    if (items.length === 0) return result;

    const byType = new Map<string, Set<string>>();
    for (const item of items) {
      const referenceId = item.referenceId?.trim();
      if (!referenceId) {
        result.set(catalogKey(item.itemType, item.referenceId ?? ''), null);
        continue;
      }
      if (item.itemType === 'package') {
        result.set(catalogKey(item.itemType, referenceId), referenceId);
        continue;
      }
      const set = byType.get(item.itemType) ?? new Set<string>();
      set.add(referenceId);
      byType.set(item.itemType, set);
    }

    await Promise.all([
      this.resolveRooms(byType.get('room'), result),
      this.resolveFlightClasses(byType.get('flight_class'), result),
      this.resolveVehicles(byType.get('vehicle'), result),
      this.resolveCabins(byType.get('cabin'), result),
      this.resolveActivitySchedules(byType.get('activity_schedule'), result),
    ]);

    for (const item of items) {
      const referenceId = item.referenceId?.trim() ?? '';
      const key = catalogKey(item.itemType, referenceId || item.referenceId);
      if (!result.has(key)) {
        result.set(key, null);
      }
    }

    return result;
  }

  async enrichItems<T extends CatalogRef>(
    items: T[],
  ): Promise<Array<T & { catalogProductId: string | null }>> {
    const map = await this.resolveProductIds(items);
    return items.map((item) => {
      const referenceId = item.referenceId?.trim() ?? '';
      const key = catalogKey(item.itemType, referenceId || item.referenceId);
      return {
        ...item,
        catalogProductId: map.get(key) ?? null,
      };
    });
  }

  private async resolveRooms(
    ids: Set<string> | undefined,
    result: Map<string, string | null>,
  ): Promise<void> {
    if (!ids?.size) return;
    const rows = await this.roomsRepository.find({
      where: { id: In([...ids]), deletedAt: IsNull() },
      select: ['id', 'propertyId'],
    });
    const found = new Map(rows.map((row) => [row.id, row.propertyId]));
    for (const id of ids) {
      result.set(catalogKey('room', id), found.get(id) ?? null);
    }
  }

  private async resolveFlightClasses(
    ids: Set<string> | undefined,
    result: Map<string, string | null>,
  ): Promise<void> {
    if (!ids?.size) return;
    const rows = await this.flightClassesRepository.find({
      where: { id: In([...ids]), deletedAt: IsNull() },
      select: ['id', 'flightId'],
    });
    const found = new Map(rows.map((row) => [row.id, row.flightId]));
    for (const id of ids) {
      result.set(catalogKey('flight_class', id), found.get(id) ?? null);
    }
  }

  private async resolveVehicles(
    ids: Set<string> | undefined,
    result: Map<string, string | null>,
  ): Promise<void> {
    if (!ids?.size) return;
    const rows = await this.vehicleAvailabilityRepository.find({
      where: { id: In([...ids]), deletedAt: IsNull() },
      select: ['id', 'vehicleId'],
    });
    const found = new Map(rows.map((row) => [row.id, row.vehicleId]));
    for (const id of ids) {
      result.set(catalogKey('vehicle', id), found.get(id) ?? null);
    }
  }

  private async resolveCabins(
    ids: Set<string> | undefined,
    result: Map<string, string | null>,
  ): Promise<void> {
    if (!ids?.size) return;
    const rows = await this.cabinAvailabilityRepository.find({
      where: { id: In([...ids]), deletedAt: IsNull() },
      select: ['id', 'sailingId'],
    });
    const found = new Map(rows.map((row) => [row.id, row.sailingId]));
    for (const id of ids) {
      result.set(catalogKey('cabin', id), found.get(id) ?? null);
    }
  }

  private async resolveActivitySchedules(
    ids: Set<string> | undefined,
    result: Map<string, string | null>,
  ): Promise<void> {
    if (!ids?.size) return;
    const rows = await this.activitySchedulesRepository.find({
      where: { id: In([...ids]), deletedAt: IsNull() },
      select: ['id', 'activityId'],
    });
    const found = new Map(rows.map((row) => [row.id, row.activityId]));
    for (const id of ids) {
      result.set(catalogKey('activity_schedule', id), found.get(id) ?? null);
    }
  }
}
