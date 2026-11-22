import type { VehicleRouteOption } from '@africatourismgate/types';
import { normalizeSiteSearchText } from './nav-match';

function cityKey(value: string): string {
  return normalizeSiteSearchText(value);
}

/** True when the query matches a city name (départ or arrivée). */
export function matchesSiteVehicleRouteCity(
  city: string,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }
  return cityKey(city).includes(normalizedQuery);
}

/**
 * True when the query matches a route pair (either city, or a
 * “dep → arr” / “dep arr” style string).
 */
export function matchesSiteVehicleRoutePair(
  pair: Pick<VehicleRouteOption, 'departureCity' | 'arrivalCity'>,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }

  const departure = cityKey(pair.departureCity);
  const arrival = cityKey(pair.arrivalCity);
  if (departure.includes(normalizedQuery) || arrival.includes(normalizedQuery)) {
    return true;
  }

  const compactQuery = normalizedQuery
    .replace(/[→>\-|,/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const arrowLabel = `${departure} ${arrival}`;
  return arrowLabel.includes(compactQuery);
}

export function vehicleRouteCityKey(value: string): string {
  return cityKey(value);
}
