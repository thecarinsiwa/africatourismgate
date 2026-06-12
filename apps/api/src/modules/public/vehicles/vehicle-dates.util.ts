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

export function assertValidVehicleDates(
  pickupDate: string,
  returnDate: string,
): void {
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
