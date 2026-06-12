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

export function assertValidFlightDates(
  departureDate: string,
  returnDate?: string,
): void {
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
