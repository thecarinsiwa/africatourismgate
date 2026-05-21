import type { VehicleAvailabilityStatus } from '@africatourismgate/types';

export const vehicleStatusLabels: Record<VehicleAvailabilityStatus, string> = {
  available: 'Disponible',
  maintenance: 'Maintenance',
  rented: 'Loué',
};

export const vehicleStatusOptions: {
  value: VehicleAvailabilityStatus;
  label: string;
}[] = (
  Object.entries(vehicleStatusLabels) as [VehicleAvailabilityStatus, string][]
).map(([value, label]) => ({ value, label }));
