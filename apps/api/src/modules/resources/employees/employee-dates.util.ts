import { BadRequestException } from '@nestjs/common';

const DATE_MESSAGE =
  'La date d’embauche doit être antérieure à la date de fin.';

function normalizeDate(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const trimmed = String(value).trim();
  return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed || null;
}

export function assertHireDateBeforeTermination(
  hireDate: string | Date | null | undefined,
  terminationDate: string | Date | null | undefined,
): void {
  const hire = normalizeDate(hireDate);
  const end = normalizeDate(terminationDate);
  if (!hire || !end) return;
  if (hire >= end) {
    throw new BadRequestException(DATE_MESSAGE);
  }
}
