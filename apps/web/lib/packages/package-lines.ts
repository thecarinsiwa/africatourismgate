import type { PackageItemEnriched, PackageItemType } from './types';

export type PackageActivityLineSelection = {
  lineType: 'activity';
  itemId: string;
  scheduleId: string;
  date: string;
  participants: number;
};

export type PackagePropertyLineSelection = {
  lineType: 'property';
  itemId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type PackageFlightLineSelection = {
  lineType: 'flight';
  itemId: string;
  flightClassId: string;
  departureDate: string;
  passengers: number;
};

export type PackageVehicleLineSelection = {
  lineType: 'vehicle';
  itemId: string;
  availabilitySlotId: string;
  pickupDate: string;
  returnDate: string;
};

export type PackageCruiseLineSelection = {
  lineType: 'cruise';
  itemId: string;
  sailingId: string;
  cabinAvailabilityId: string;
  guests: number;
};

export type PackageLineSelection =
  | PackageActivityLineSelection
  | PackagePropertyLineSelection
  | PackageFlightLineSelection
  | PackageVehicleLineSelection
  | PackageCruiseLineSelection;

function readString(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
}

function readPositiveInt(value: string | string[] | undefined): number | null {
  const n = Number.parseInt(readString(value), 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

function inferLineType(
  raw: Record<string, string | string[] | undefined>,
  index: number,
): PackageItemType | '' {
  const explicit = readString(raw[`line${index}_type`]) as PackageItemType | '';
  if (explicit) return explicit;
  if (readString(raw[`line${index}_activityId`])) return 'activity';
  if (readString(raw[`line${index}_roomId`])) return 'property';
  if (readString(raw[`line${index}_flightClassId`])) return 'flight';
  if (readString(raw[`line${index}_availabilitySlotId`])) return 'vehicle';
  if (readString(raw[`line${index}_cabinAvailabilityId`])) return 'cruise';
  return '';
}

export function parsePackageLineAtIndex(
  raw: Record<string, string | string[] | undefined>,
  index: number,
  fallback?: { date?: string; participants?: number },
): PackageLineSelection | null {
  const lineType = inferLineType(raw, index);
  const itemId = readString(raw[`line${index}_itemId`]);

  if (lineType === 'activity') {
    const activityItemId = itemId || readString(raw[`line${index}_activityId`]);
    const scheduleId = readString(raw[`line${index}_scheduleId`]);
    const date = readString(raw[`line${index}_date`]) || fallback?.date || readString(raw.date);
    const participants =
      readPositiveInt(raw[`line${index}_participants`]) ??
      fallback?.participants ??
      readPositiveInt(raw.participants);
    if (!activityItemId || !scheduleId || !date || participants == null) return null;
    return {
      lineType: 'activity',
      itemId: activityItemId,
      scheduleId,
      date,
      participants,
    };
  }

  if (lineType === 'property') {
    const propertyItemId = itemId || readString(raw[`line${index}_propertyId`]);
    const roomId = readString(raw[`line${index}_roomId`]);
    const checkIn = readString(raw[`line${index}_checkIn`]) || readString(raw.checkIn);
    const checkOut = readString(raw[`line${index}_checkOut`]) || readString(raw.checkOut);
    const guests =
      readPositiveInt(raw[`line${index}_guests`]) ?? readPositiveInt(raw.guests);
    if (!propertyItemId || !roomId || !checkIn || !checkOut || guests == null) return null;
    return { lineType: 'property', itemId: propertyItemId, roomId, checkIn, checkOut, guests };
  }

  if (lineType === 'flight') {
    const flightItemId = itemId || readString(raw[`line${index}_flightId`]);
    const flightClassId = readString(raw[`line${index}_flightClassId`]);
    const departureDate =
      readString(raw[`line${index}_departureDate`]) || readString(raw.departureDate);
    const passengers =
      readPositiveInt(raw[`line${index}_passengers`]) ?? readPositiveInt(raw.passengers);
    if (!flightItemId || !flightClassId || !departureDate || passengers == null) return null;
    return {
      lineType: 'flight',
      itemId: flightItemId,
      flightClassId,
      departureDate,
      passengers,
    };
  }

  if (lineType === 'vehicle') {
    const vehicleItemId = itemId || readString(raw[`line${index}_vehicleId`]);
    const availabilitySlotId = readString(raw[`line${index}_availabilitySlotId`]);
    const pickupDate =
      readString(raw[`line${index}_pickupDate`]) || readString(raw.pickupDate);
    const returnDate =
      readString(raw[`line${index}_returnDate`]) || readString(raw.returnDate);
    if (!vehicleItemId || !availabilitySlotId || !pickupDate || !returnDate) return null;
    if (returnDate <= pickupDate) return null;
    return {
      lineType: 'vehicle',
      itemId: vehicleItemId,
      availabilitySlotId,
      pickupDate,
      returnDate,
    };
  }

  if (lineType === 'cruise') {
    const cabinItemId = itemId || readString(raw[`line${index}_cabinId`]);
    const sailingId = readString(raw[`line${index}_sailingId`]) || readString(raw.sailingId);
    const cabinAvailabilityId = readString(raw[`line${index}_cabinAvailabilityId`]);
    const guests =
      readPositiveInt(raw[`line${index}_guests`]) ?? readPositiveInt(raw.guests);
    if (!cabinItemId || !sailingId || !cabinAvailabilityId || guests == null) return null;
    return {
      lineType: 'cruise',
      itemId: cabinItemId,
      sailingId,
      cabinAvailabilityId,
      guests,
    };
  }

  return null;
}

export function parsePackageLinesFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): PackageLineSelection[] | null {
  const lineCount = readPositiveInt(raw.lineCount);
  if (lineCount == null || lineCount < 1) return null;

  const fallbackDate =
    readString(raw.startDate) ||
    readString(raw.date) ||
    readString(raw.checkIn) ||
    undefined;
  const fallbackParticipants =
    readPositiveInt(raw.travelers) ?? readPositiveInt(raw.participants) ?? undefined;
  const lines: PackageLineSelection[] = [];

  for (let index = 0; index < lineCount; index += 1) {
    const line = parsePackageLineAtIndex(raw, index, {
      date: fallbackDate,
      participants: fallbackParticipants,
    });
    if (!line) return null;
    lines.push(line);
  }

  return lines;
}

export function appendPackageLineToParams(
  params: URLSearchParams,
  index: number,
  line: PackageLineSelection,
): void {
  params.set(`line${index}_type`, line.lineType);
  params.set(`line${index}_itemId`, line.itemId);

  switch (line.lineType) {
    case 'activity':
      params.set(`line${index}_activityId`, line.itemId);
      params.set(`line${index}_scheduleId`, line.scheduleId);
      params.set(`line${index}_date`, line.date);
      params.set(`line${index}_participants`, String(line.participants));
      break;
    case 'property':
      params.set(`line${index}_propertyId`, line.itemId);
      params.set(`line${index}_roomId`, line.roomId);
      params.set(`line${index}_checkIn`, line.checkIn);
      params.set(`line${index}_checkOut`, line.checkOut);
      params.set(`line${index}_guests`, String(line.guests));
      break;
    case 'flight':
      params.set(`line${index}_flightId`, line.itemId);
      params.set(`line${index}_flightClassId`, line.flightClassId);
      params.set(`line${index}_departureDate`, line.departureDate);
      params.set(`line${index}_passengers`, String(line.passengers));
      break;
    case 'vehicle':
      params.set(`line${index}_vehicleId`, line.itemId);
      params.set(`line${index}_availabilitySlotId`, line.availabilitySlotId);
      params.set(`line${index}_pickupDate`, line.pickupDate);
      params.set(`line${index}_returnDate`, line.returnDate);
      break;
    case 'cruise':
      params.set(`line${index}_cabinId`, line.itemId);
      params.set(`line${index}_sailingId`, line.sailingId);
      params.set(`line${index}_cabinAvailabilityId`, line.cabinAvailabilityId);
      params.set(`line${index}_guests`, String(line.guests));
      break;
    default:
      break;
  }
}

export function lineMatchesPackageItem(
  line: PackageLineSelection,
  item: PackageItemEnriched,
): boolean {
  return line.lineType === item.itemType && line.itemId === item.itemId;
}

export function buildPackageLinesDraft(
  packageId: string,
  items: PackageItemEnriched[],
  selections: Array<PackageLineSelection | null | undefined>,
): { kind: 'package'; packageId: string; lines: PackageLineSelection[] } | null {
  if (items.length === 0 || selections.length !== items.length) return null;

  const lines: PackageLineSelection[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const selection = selections[index];
    if (!selection || !lineMatchesPackageItem(selection, items[index]!)) {
      return null;
    }
    lines.push(selection);
  }

  return { kind: 'package', packageId, lines };
}
