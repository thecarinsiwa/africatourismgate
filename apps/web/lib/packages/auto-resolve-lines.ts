import { getPackageResolvedLines } from '../api/public';
import type { PackageLineSelection } from './package-lines';
import type { PackageTravelDates } from './package-dates';
import type { PackageItemEnriched } from './types';

export type PackageLineResolveError = {
  itemId: string;
  label: string;
  message: 'missing';
};

export type AutoResolvePackageLinesResult = {
  lines: Array<PackageLineSelection | null>;
  errors: PackageLineResolveError[];
};

type ResolvedLineResponse = Awaited<ReturnType<typeof getPackageResolvedLines>>[number];

function toPackageLineSelection(line: ResolvedLineResponse): PackageLineSelection {
  switch (line.lineType) {
    case 'activity':
      return {
        lineType: 'activity',
        itemId: line.itemId,
        scheduleId: line.scheduleId!,
        date: line.date!,
        participants: line.participants!,
      };
    case 'property':
      return {
        lineType: 'property',
        itemId: line.itemId,
        roomId: line.roomId!,
        checkIn: line.checkIn!,
        checkOut: line.checkOut!,
        guests: line.guests!,
      };
    case 'flight':
      return {
        lineType: 'flight',
        itemId: line.itemId,
        flightClassId: line.flightClassId!,
        departureDate: line.departureDate!,
        passengers: line.passengers!,
      };
    case 'vehicle':
      return {
        lineType: 'vehicle',
        itemId: line.itemId,
        availabilitySlotId: line.availabilitySlotId!,
        pickupDate: line.pickupDate!,
        returnDate: line.returnDate!,
      };
    case 'cruise':
      return {
        lineType: 'cruise',
        itemId: line.itemId,
        sailingId: line.sailingId!,
        cabinAvailabilityId: line.cabinAvailabilityId!,
        guests: line.guests!,
      };
    default:
      throw new Error('Unsupported package line type');
  }
}

export async function autoResolvePackageLines(
  packageId: string,
  items: PackageItemEnriched[],
  dates: PackageTravelDates,
): Promise<AutoResolvePackageLinesResult> {
  const lines: Array<PackageLineSelection | null> = Array.from(
    { length: items.length },
    () => null,
  );
  const errors: PackageLineResolveError[] = [];

  try {
    const resolved = await getPackageResolvedLines(packageId, {
      startDate: dates.startDate,
      endDate: dates.endDate,
      travelers: dates.travelers,
    });

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]!;
      const match = resolved.find(
        (entry) => entry.itemId === item.itemId && entry.lineType === item.itemType,
      );
      if (match) {
        lines[index] = toPackageLineSelection(match);
      } else {
        errors.push({ itemId: item.itemId, label: item.label, message: 'missing' });
      }
    }
  } catch {
    for (const item of items) {
      errors.push({ itemId: item.itemId, label: item.label, message: 'missing' });
    }
  }

  return { lines, errors };
}
