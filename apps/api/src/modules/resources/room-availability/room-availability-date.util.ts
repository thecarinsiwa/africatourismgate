import { BadRequestException } from '@nestjs/common';

const MAX_BULK_DAYS = 90;

export function enumerateDates(dateFrom: string, dateTo: string): string[] {
  const start = parseDateOnly(dateFrom);
  const end = parseDateOnly(dateTo);
  if (start > end) {
    throw new BadRequestException('dateFrom doit être antérieure ou égale à dateTo.');
  }

  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(formatDateOnly(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  if (dates.length > MAX_BULK_DAYS) {
    throw new BadRequestException(
      `La plage ne peut pas dépasser ${MAX_BULK_DAYS} jours.`,
    );
  }

  return dates;
}

function parseDateOnly(iso: string): Date {
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
