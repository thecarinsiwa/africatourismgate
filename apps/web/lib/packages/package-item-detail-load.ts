import type { PropertyDetail } from '@africatourismgate/types';
import type { ActivityDetail } from '../activities/types';
import type { VehicleDetail } from '../cars/types';
import type { CruiseCabinOffer, CruiseSailingDetail } from '../cruises/types';
import type { FlightDetail } from '../flights/types';
import {
  getAccommodationDetail,
  getActivityDetail,
  getCruiseSailingDetail,
  getFlightDetail,
  getPackageResolvedLines,
  getVehicleDetail,
} from '../api/public';
import type { PackageItemEnriched } from './types';

export type PackageItemDetailContext = {
  packageId: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
};

export type PackageItemDetailData =
  | { kind: 'activity'; detail: ActivityDetail }
  | { kind: 'vehicle'; detail: VehicleDetail }
  | { kind: 'property'; detail: PropertyDetail }
  | { kind: 'flight'; detail: FlightDetail }
  | { kind: 'cruise'; detail: CruiseSailingDetail; cabin: CruiseCabinOffer; sailingId: string };

function defaultPreviewDate(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function resolveStayDates(
  startDate?: string,
  endDate?: string,
): { start: string; end: string } {
  const start = startDate?.trim() || defaultPreviewDate();
  const end =
    endDate?.trim() && endDate > start ? endDate.trim() : addDays(start, 3);
  return { start, end };
}

async function resolveCruiseSailingId(
  packageId: string,
  cabinId: string,
  ctx: PackageItemDetailContext,
): Promise<string> {
  const { start, end } = resolveStayDates(ctx.startDate, ctx.endDate);
  const travelers = ctx.travelers ?? 1;
  const lines = await getPackageResolvedLines(packageId, {
    startDate: start,
    endDate: end,
    travelers,
  });
  const cruiseLine = lines.find(
    (line) => line.lineType === 'cruise' && line.itemId === cabinId,
  );
  if (!cruiseLine?.sailingId) {
    throw new Error('Cruise sailing not found');
  }
  return cruiseLine.sailingId;
}

export async function loadPackageItemDetail(
  item: PackageItemEnriched,
  ctx: PackageItemDetailContext,
): Promise<PackageItemDetailData> {
  const travelers = ctx.travelers ?? 1;
  const { start, end } = resolveStayDates(ctx.startDate, ctx.endDate);

  switch (item.itemType) {
    case 'activity':
      return {
        kind: 'activity',
        detail: await getActivityDetail(item.itemId, {
          date: start,
          participants: travelers,
        }),
      };
    case 'vehicle':
      return {
        kind: 'vehicle',
        detail: await getVehicleDetail(item.itemId, {
          pickupDate: start,
          returnDate: end,
        }),
      };
    case 'property':
      return {
        kind: 'property',
        detail: await getAccommodationDetail(item.itemId, {
          checkIn: start,
          checkOut: end,
          guests: travelers,
        }),
      };
    case 'flight':
      return {
        kind: 'flight',
        detail: await getFlightDetail(item.itemId, {
          departureDate: start,
          passengers: travelers,
        }),
      };
    case 'cruise': {
      const sailingId = await resolveCruiseSailingId(ctx.packageId, item.itemId, ctx);
      const detail = await getCruiseSailingDetail(sailingId, { guests: travelers });
      const cabin =
        detail.cabins.find((offer) => offer.cabinId === item.itemId) ?? detail.cabins[0];
      if (!cabin) {
        throw new Error('Cabin not found');
      }
      return { kind: 'cruise', detail, cabin, sailingId };
    }
    default:
      throw new Error('Unsupported item type');
  }
}
