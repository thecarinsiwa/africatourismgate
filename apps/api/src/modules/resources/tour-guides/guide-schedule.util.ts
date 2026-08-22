import { BadRequestException } from '@nestjs/common';

export function parseScheduleInstant(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Date ou heure invalide.');
  }
  return date;
}

export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function assertValidInterval(start: Date, end: Date): void {
  if (!(start < end)) {
    throw new BadRequestException(
      "L'heure de fin doit être postérieure à l'heure de début.",
    );
  }
}

/** Bornes journalières locales pour une date ISO YYYY-MM-DD. */
export function dayBounds(date: string): { start: Date; end: Date } {
  const day = date.slice(0, 10);
  return {
    start: new Date(`${day}T00:00:00`),
    end: new Date(`${day}T23:59:59`),
  };
}

export function resolveScheduleRange(input: {
  date?: string;
  startDatetime?: string;
  endDatetime?: string;
}): { start: Date; end: Date } {
  if (input.startDatetime && input.endDatetime) {
    const start = parseScheduleInstant(input.startDatetime);
    const end = parseScheduleInstant(input.endDatetime);
    assertValidInterval(start, end);
    return { start, end };
  }

  if (input.date) {
    return dayBounds(input.date);
  }

  throw new BadRequestException(
    'Indiquez startDatetime et endDatetime, ou une date (journée entière).',
  );
}

export function formatScheduleInstant(value: Date): string {
  return value.toISOString();
}

export function overlapsDay(
  slotStart: Date,
  slotEnd: Date,
  date: string,
): boolean {
  const { start, end } = dayBounds(date);
  return intervalsOverlap(slotStart, slotEnd, start, end);
}

export function deriveVisitWindowFromItems(
  items: Array<{ startDate: string | null; endDate?: string | null }>,
): { start: Date; end: Date; startDate: string; endDate: string } | null {
  const dated = items.filter((item) => item.startDate);
  if (dated.length === 0) {
    return null;
  }

  const starts = dated.map((item) => item.startDate!.slice(0, 10)).sort();
  const ends = dated
    .map((item) => (item.endDate ?? item.startDate)!.slice(0, 10))
    .sort();
  const startDate = starts[0]!;
  const endDate = ends[ends.length - 1]!;

  return {
    startDate,
    endDate,
    start: dayBounds(startDate).start,
    end: dayBounds(endDate).end,
  };
}

export function assertWithinVisitWindow(
  window: { start: Date; end: Date },
  slotStart: Date,
  slotEnd: Date,
): void {
  if (slotStart < window.start || slotEnd > window.end) {
    throw new BadRequestException(
      'Le créneau doit être compris dans la période de la réservation.',
    );
  }
}
