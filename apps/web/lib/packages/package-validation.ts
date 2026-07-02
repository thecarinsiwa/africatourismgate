import type { PackageDraftValidationData, PackageReservationDraft } from '../reservations/flow';

export async function fetchPackageDraftValidationData(
  _draft: PackageReservationDraft,
): Promise<PackageDraftValidationData> {
  return {
    activityDetails: {},
    propertyDetails: {},
    flightDetails: {},
    vehicleDetails: {},
    cruiseDetails: {},
  };
}

export type { PackageDraftValidationData } from '../reservations/flow';
