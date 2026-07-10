export type FlightReportLocale = 'fr' | 'en' | 'es';

export function resolveFlightReportLocale(language?: string | null): FlightReportLocale {
  const code = language?.trim().toLowerCase().slice(0, 2);
  if (code === 'en' || code === 'es') {
    return code;
  }
  return 'fr';
}
