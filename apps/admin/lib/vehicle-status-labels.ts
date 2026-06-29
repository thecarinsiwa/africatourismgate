import type { VehicleAvailabilityStatus } from '@africatourismgate/types';

export const VEHICLE_AVAILABILITY_STATUSES: VehicleAvailabilityStatus[] = [
  'available',
  'maintenance',
  'rented',
];

export function getVehicleStatusLabel(
  status: VehicleAvailabilityStatus,
  labels: Record<VehicleAvailabilityStatus, string>,
): string {
  return labels[status];
}
