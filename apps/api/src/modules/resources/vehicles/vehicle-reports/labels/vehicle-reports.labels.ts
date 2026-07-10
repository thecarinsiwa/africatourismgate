export type VehicleReportLocale = 'fr' | 'en' | 'es';

export function resolveVehicleReportLocale(language?: string | null): VehicleReportLocale {
  const code = language?.trim().toLowerCase().slice(0, 2);
  if (code === 'en' || code === 'es') {
    return code;
  }
  return 'fr';
}
