export type AccommodationReportLocale = 'fr' | 'en' | 'es';

export function resolveAccommodationReportLocale(
  language?: string | null,
): AccommodationReportLocale {
  const code = language?.trim().toLowerCase().slice(0, 2);
  if (code === 'en' || code === 'es') {
    return code;
  }
  return 'fr';
}
