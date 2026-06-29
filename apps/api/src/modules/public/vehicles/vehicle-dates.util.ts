import { BadRequestException } from '@nestjs/common';

const MAX_RENTAL_DAYS = 90;

export function parseDateOnly(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new BadRequestException('Date invalide (format attendu : YYYY-MM-DD).');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayDateOnly(): string {
  return formatDateOnly(new Date());
}

export function addDaysToDateOnly(iso: string, days: number): string {
  const date = parseDateOnly(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnly(date);
}

export const DEFAULT_BROWSE_RENTAL_DAYS = 7;

export function assertValidVehicleDates(
  pickupDate?: string,
  returnDate?: string,
): void {
  if (!pickupDate && returnDate) {
    throw new BadRequestException(
      'pickupDate est requis lorsque returnDate est fourni.',
    );
  }
  if (!pickupDate) {
    return;
  }
  parseDateOnly(pickupDate);
  if (!returnDate) {
    return;
  }
  const pickup = parseDateOnly(pickupDate);
  const returnDay = parseDateOnly(returnDate);
  if (returnDay <= pickup) {
    throw new BadRequestException(
      'returnDate doit être postérieure à pickupDate.',
    );
  }
  const rentalDays = countRentalDays(pickupDate, returnDate);
  if (rentalDays > MAX_RENTAL_DAYS) {
    throw new BadRequestException(
      `La location ne peut pas dépasser ${MAX_RENTAL_DAYS} jours.`,
    );
  }
}

/** Calendar rental days: pickup inclusive, return exclusive. */
export function countRentalDays(pickupDate: string, returnDate: string): number {
  const pickup = parseDateOnly(pickupDate);
  const returnDay = parseDateOnly(returnDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((returnDay.getTime() - pickup.getTime()) / msPerDay);
}

export function pickupPeriodBounds(
  pickupDate: string,
  returnDate: string,
): { pickupStart: Date; returnEnd: Date } {
  assertValidVehicleDates(pickupDate, returnDate);
  const pickupStart = parseDateOnly(pickupDate);
  const returnEnd = parseDateOnly(returnDate);
  returnEnd.setUTCHours(23, 59, 59, 999);
  return { pickupStart, returnEnd };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function dateOnlyFromDatetime(value: Date | string): string {
  return toDate(value).toISOString().slice(0, 10);
}

export function resolveDefaultRentalWindow(
  slotStart: Date | string,
  slotEnd: Date | string,
  today: string = todayDateOnly(),
  defaultRentalDays: number = DEFAULT_BROWSE_RENTAL_DAYS,
): { pickupDate: string; returnDate: string } | null {
  const slotStartDate = dateOnlyFromDatetime(slotStart);
  const pickupDate = slotStartDate > today ? slotStartDate : today;
  const idealReturn = addDaysToDateOnly(pickupDate, defaultRentalDays);

  if (slotCoversRentalPeriod(slotStart, slotEnd, pickupDate, idealReturn)) {
    return { pickupDate, returnDate: idealReturn };
  }

  const minReturn = addDaysToDateOnly(pickupDate, 1);
  if (slotCoversRentalPeriod(slotStart, slotEnd, pickupDate, minReturn)) {
    return { pickupDate, returnDate: minReturn };
  }

  return null;
}

/** Slot calendar range must cover pickup through return (inclusive days). */
export function slotCoversRentalPeriod(
  slotStart: Date | string,
  slotEnd: Date | string,
  pickupDate: string,
  returnDate: string,
): boolean {
  const pickupDay = parseDateOnly(pickupDate).getTime();
  const returnDay = parseDateOnly(returnDate).getTime();
  const slotStartDay = startOfUtcDay(toDate(slotStart));
  const slotEndDay = startOfUtcDay(toDate(slotEnd));
  return slotStartDay <= pickupDay && slotEndDay >= returnDay;
}
