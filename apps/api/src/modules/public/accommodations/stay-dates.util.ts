import { BadRequestException } from '@nestjs/common';

/** Nights for a stay: checkIn inclusive, checkOut exclusive. */
export function enumerateStayNights(checkIn: string, checkOut: string): string[] {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  if (start >= end) {
    throw new BadRequestException('checkOut doit être postérieur à checkIn.');
  }

  const dates: string[] = [];
  const cur = new Date(start);
  while (cur < end) {
    dates.push(formatDateOnly(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  if (dates.length > 90) {
    throw new BadRequestException('Le séjour ne peut pas dépasser 90 nuits.');
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

/** All calendar days in a month (YYYY-MM). */
export function enumerateMonthDays(isoMonth: string): string[] {
  const match = /^(\d{4})-(\d{2})$/.exec(isoMonth);
  if (!match) {
    throw new BadRequestException('month invalide (format attendu : YYYY-MM).');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new BadRequestException('month invalide (format attendu : YYYY-MM).');
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthStr = String(month).padStart(2, '0');
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return `${year}-${monthStr}-${day}`;
  });
}
