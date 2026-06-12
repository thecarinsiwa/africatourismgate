import { BadRequestException } from '@nestjs/common';

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

export function assertValidFlightDates(
  departureDate?: string,
  returnDate?: string,
): void {
  if (!departureDate && returnDate) {
    throw new BadRequestException(
      'departureDate est requis lorsque returnDate est fourni.',
    );
  }
  if (!departureDate) {
    return;
  }
  parseDateOnly(departureDate);
  if (!returnDate) {
    return;
  }
  const dep = parseDateOnly(departureDate);
  const ret = parseDateOnly(returnDate);
  if (ret <= dep) {
    throw new BadRequestException(
      'returnDate doit être postérieure à departureDate.',
    );
  }
}
