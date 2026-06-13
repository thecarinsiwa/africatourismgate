import {
  getAccommodationDetail,
  getActivityDetail,
  getCruiseSailingDetail,
  getFlightDetail,
  getVehicleDetail,
  searchCruises,
} from '../api/public';
import {
  isActivityScheduleOfferBookable,
  isCabinOfferBookable,
} from '../reservations/flow';
import type { PackageLineSelection } from './package-lines';
import type { PackageTravelDates } from './package-dates';
import type { PackageItemEnriched } from './types';

export type PackageLineResolveError = {
  itemId: string;
  label: string;
  message: 'unavailable' | 'error';
};

export type AutoResolvePackageLinesResult = {
  lines: Array<PackageLineSelection | null>;
  errors: PackageLineResolveError[];
};

async function resolveActivityLine(
  item: PackageItemEnriched,
  dates: PackageTravelDates,
): Promise<PackageLineSelection | null> {
  const detail = await getActivityDetail(item.itemId, {
    date: dates.startDate,
    participants: dates.travelers,
  });
  const schedule = detail.schedules.find((slot) =>
    isActivityScheduleOfferBookable(slot, dates.travelers),
  );
  if (!schedule) return null;
  return {
    lineType: 'activity',
    itemId: item.itemId,
    scheduleId: schedule.scheduleId,
    date: dates.startDate,
    participants: dates.travelers,
  };
}

async function resolvePropertyLine(
  item: PackageItemEnriched,
  dates: PackageTravelDates,
): Promise<PackageLineSelection | null> {
  const detail = await getAccommodationDetail(item.itemId, {
    checkIn: dates.startDate,
    checkOut: dates.endDate,
    guests: dates.travelers,
  });
  const room = detail.rooms.find((entry) => entry.available);
  if (!room) return null;
  return {
    lineType: 'property',
    itemId: item.itemId,
    roomId: room.id,
    checkIn: dates.startDate,
    checkOut: dates.endDate,
    guests: dates.travelers,
  };
}

async function resolveFlightLine(
  item: PackageItemEnriched,
  dates: PackageTravelDates,
): Promise<PackageLineSelection | null> {
  const detail = await getFlightDetail(item.itemId, {
    departureDate: dates.startDate,
    passengers: dates.travelers,
  });
  const flightClass = detail.classes.find(
    (entry) => entry.availableSeats >= dates.travelers,
  );
  if (!flightClass) return null;
  return {
    lineType: 'flight',
    itemId: item.itemId,
    flightClassId: flightClass.id,
    departureDate: dates.startDate,
    passengers: dates.travelers,
  };
}

async function resolveVehicleLine(
  item: PackageItemEnriched,
  dates: PackageTravelDates,
): Promise<PackageLineSelection | null> {
  const detail = await getVehicleDetail(item.itemId, {
    pickupDate: dates.startDate,
    returnDate: dates.endDate,
  });
  if (!detail.availabilitySlot?.id) return null;
  return {
    lineType: 'vehicle',
    itemId: item.itemId,
    availabilitySlotId: detail.availabilitySlot.id,
    pickupDate: dates.startDate,
    returnDate: dates.endDate,
  };
}

async function resolveCruiseLine(
  item: PackageItemEnriched,
  dates: PackageTravelDates,
): Promise<PackageLineSelection | null> {
  const search = await searchCruises({
    startDate: dates.startDate,
    endDate: dates.startDate,
    guests: dates.travelers,
    limit: 50,
  });

  for (const sailing of search.data) {
    const detail = await getCruiseSailingDetail(sailing.id, {
      guests: dates.travelers,
    }).catch(() => null);
    if (!detail) continue;

    const cabin = detail.cabins.find(
      (entry) =>
        entry.cabinId === item.itemId &&
        isCabinOfferBookable(entry, dates.travelers),
    );
    if (!cabin) continue;

    return {
      lineType: 'cruise',
      itemId: item.itemId,
      sailingId: sailing.id,
      cabinAvailabilityId: cabin.availabilityId,
      guests: dates.travelers,
    };
  }

  return null;
}

async function resolvePackageItemLine(
  item: PackageItemEnriched,
  dates: PackageTravelDates,
): Promise<PackageLineSelection | null> {
  switch (item.itemType) {
    case 'activity':
      return resolveActivityLine(item, dates);
    case 'property':
      return resolvePropertyLine(item, dates);
    case 'flight':
      return resolveFlightLine(item, dates);
    case 'vehicle':
      return resolveVehicleLine(item, dates);
    case 'cruise':
      return resolveCruiseLine(item, dates);
    default:
      return null;
  }
}

export async function autoResolvePackageLines(
  items: PackageItemEnriched[],
  dates: PackageTravelDates,
): Promise<AutoResolvePackageLinesResult> {
  const lines: Array<PackageLineSelection | null> = Array.from(
    { length: items.length },
    () => null,
  );
  const errors: PackageLineResolveError[] = [];

  await Promise.all(
    items.map(async (item, index) => {
      try {
        const line = await resolvePackageItemLine(item, dates);
        lines[index] = line;
        if (!line) {
          errors.push({
            itemId: item.itemId,
            label: item.label,
            message: 'unavailable',
          });
        }
      } catch {
        lines[index] = null;
        errors.push({
          itemId: item.itemId,
          label: item.label,
          message: 'error',
        });
      }
    }),
  );

  return { lines, errors };
}
