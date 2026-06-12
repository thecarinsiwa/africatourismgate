import type { PublicAirport } from './types';

export type FlightAirportOption = PublicAirport & {
  label: string;
};

export function airportOptionLabel(airport: PublicAirport): string {
  return `${airport.city} (${airport.iataCode})`;
}

export function toFlightAirportOptions(airports: PublicAirport[]): FlightAirportOption[] {
  return airports.map((airport) => ({
    ...airport,
    label: airportOptionLabel(airport),
  }));
}

export function resolveAirportCode(
  input: string,
  airports: PublicAirport[] = [],
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const byCity = airports.find(
    (airport) => airport.city.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byCity) return byCity.iataCode.toUpperCase();

  const byName = airports.find(
    (airport) => airport.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byName) return byName.iataCode.toUpperCase();

  return null;
}

type AirportLabelContext =
  | PublicAirport[]
  | Pick<PublicAirport, 'city' | 'iataCode'>;

export function formatAirportLabel(
  iata: string,
  context: AirportLabelContext = [],
): string {
  if (!Array.isArray(context) && context.city && context.iataCode) {
    return `${context.city} (${context.iataCode})`;
  }

  const airports = Array.isArray(context) ? context : [];
  const match = airports.find(
    (airport) => airport.iataCode.toUpperCase() === iata.toUpperCase(),
  );
  return match ? airportOptionLabel(match) : iata.toUpperCase();
}
