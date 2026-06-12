import { BadRequestException } from '@nestjs/common';

const MAX_SEARCH_WINDOW_DAYS = 365;

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

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function assertValidCruiseSearchDates(
  startDate: string,
  endDate: string,
): void {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (end < start) {
    throw new BadRequestException(
      'endDate doit être postérieure ou égale à startDate.',
    );
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  const windowDays = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
  if (windowDays > MAX_SEARCH_WINDOW_DAYS) {
    throw new BadRequestException(
      `La fenêtre de recherche ne peut pas dépasser ${MAX_SEARCH_WINDOW_DAYS} jours.`,
    );
  }
}

/** Indicative cruise end date: departure + durationNights calendar days (UTC). */
export function computeReturnDate(
  departureDate: string,
  durationNights: number,
): string {
  const departure = parseDateOnly(departureDate);
  const returnDate = new Date(departure);
  returnDate.setUTCDate(returnDate.getUTCDate() + durationNights);
  return formatDateOnly(returnDate);
}
