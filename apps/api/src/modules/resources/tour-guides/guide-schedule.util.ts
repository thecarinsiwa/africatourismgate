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
