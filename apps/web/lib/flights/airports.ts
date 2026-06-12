export type FlightAirportOption = {
  iata: string;
  city: string;
  label: string;
};

/** Airports aligned with home search cities and seed data (FIH, NBO). */
export const FLIGHT_AIRPORT_OPTIONS: FlightAirportOption[] = [
  { iata: 'FIH', city: 'Kinshasa', label: 'Kinshasa (FIH)' },
  { iata: 'NBO', city: 'Nairobi', label: 'Nairobi (NBO)' },
  { iata: 'CPT', city: 'Le Cap', label: 'Le Cap (CPT)' },
  { iata: 'RAK', city: 'Marrakech', label: 'Marrakech (RAK)' },
  { iata: 'ZNZ', city: 'Zanzibar', label: 'Zanzibar (ZNZ)' },
  { iata: 'KGL', city: 'Kigali', label: 'Kigali (KGL)' },
  { iata: 'LOS', city: 'Lagos', label: 'Lagos (LOS)' },
  { iata: 'ACC', city: 'Accra', label: 'Accra (ACC)' },
  { iata: 'CAI', city: 'Le Caire', label: 'Le Caire (CAI)' },
  { iata: 'DSS', city: 'Dakar', label: 'Dakar (DSS)' },
  { iata: 'CMN', city: 'Casablanca', label: 'Casablanca (CMN)' },
  { iata: 'ADD', city: 'Addis-Abeba', label: 'Addis-Abeba (ADD)' },
  { iata: 'DAR', city: 'Dar es Salaam', label: 'Dar es Salaam (DAR)' },
  { iata: 'EBB', city: 'Kampala', label: 'Kampala (EBB)' },
];

const CITY_TO_IATA = new Map<string, string>(
  FLIGHT_AIRPORT_OPTIONS.flatMap((airport) => [
    [airport.city.toLowerCase(), airport.iata],
    [airport.iata.toLowerCase(), airport.iata],
  ]),
);

/** Maps a city name or 3-letter IATA code to an uppercase IATA code. */
export function resolveAirportCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return CITY_TO_IATA.get(trimmed.toLowerCase()) ?? null;
}

export function formatAirportLabel(iata: string): string {
  const match = FLIGHT_AIRPORT_OPTIONS.find(
    (airport) => airport.iata.toUpperCase() === iata.toUpperCase(),
  );
  return match?.label ?? iata.toUpperCase();
}
