import type { FlightClassName } from '@africatourismgate/types';

export const flightClassLabels: Record<FlightClassName, string> = {
  economy: 'Économique',
  premium_economy: 'Économique premium',
  business: 'Affaires',
  first: 'Première',
};

export const flightClassOptions: { value: FlightClassName; label: string }[] = (
  Object.entries(flightClassLabels) as [FlightClassName, string][]
).map(([value, label]) => ({ value, label }));
