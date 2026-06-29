import type { FlightClassName } from '@africatourismgate/types';

export const FLIGHT_CLASS_NAMES: FlightClassName[] = [
  'economy',
  'premium_economy',
  'business',
  'first',
];

export function getFlightClassLabel(
  className: FlightClassName,
  labels: Record<FlightClassName, string>,
): string {
  return labels[className];
}
