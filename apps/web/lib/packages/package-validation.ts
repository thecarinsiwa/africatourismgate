import type { PackageDraftValidationData } from '../reservations/flow';

export async function fetchPackageDraftValidationData(): Promise<PackageDraftValidationData> {
  return {
    activityDetails: {},
    propertyDetails: {},
    flightDetails: {},
    vehicleDetails: {},
    cruiseDetails: {},
  };
}

export type { PackageDraftValidationData } from '../reservations/flow';
