import type { BookingItemType } from '@africatourismgate/types';

export const itemTypeLabels: Record<BookingItemType, string> = {
  room: 'Chambre',
  flight_class: 'Vol',
  vehicle: 'Véhicule',
  cabin: 'Cabine',
  activity_schedule: 'Activité',
  package: 'Forfait',
};

export const itemTypeOptions = Object.entries(itemTypeLabels) as [BookingItemType, string][];
