import type { PropertyDetail } from '@africatourismgate/types';
import type { ActivityDetail } from '../activities/types';
import type { VehicleDetail } from '../cars/types';
import type { CruiseSailingDetail } from '../cruises/types';
import type { FlightDetail } from '../flights/types';
import {
  getAccommodationDetail,
  getActivityDetail,
  getCruiseSailingDetail,
  getFlightDetail,
  getVehicleDetail,
} from '../api/public';
import type { PackageDraftValidationData, PackageReservationDraft } from '../reservations/flow';

export async function fetchPackageDraftValidationData(
  draft: PackageReservationDraft,
): Promise<PackageDraftValidationData> {
  const activityDetails: PackageDraftValidationData['activityDetails'] = {};
  const propertyDetails: PackageDraftValidationData['propertyDetails'] = {};
  const flightDetails: PackageDraftValidationData['flightDetails'] = {};
  const vehicleDetails: PackageDraftValidationData['vehicleDetails'] = {};
  const cruiseDetails: PackageDraftValidationData['cruiseDetails'] = {};

  await Promise.all(
    draft.lines.map(async (line) => {
      switch (line.lineType) {
        case 'activity':
          activityDetails[line.itemId] = await getActivityDetail(line.itemId, {
            date: line.date,
            participants: line.participants,
          }).catch(() => null);
          break;
        case 'property':
          propertyDetails[line.itemId] = await getAccommodationDetail(line.itemId, {
            checkIn: line.checkIn,
            checkOut: line.checkOut,
            guests: line.guests,
          }).catch(() => null);
          break;
        case 'flight':
          flightDetails[line.itemId] = await getFlightDetail(line.itemId, {
            departureDate: line.departureDate,
            passengers: line.passengers,
          }).catch(() => null);
          break;
        case 'vehicle':
          vehicleDetails[line.itemId] = await getVehicleDetail(line.itemId, {
            pickupDate: line.pickupDate,
            returnDate: line.returnDate,
          }).catch(() => null);
          break;
        case 'cruise':
          cruiseDetails[line.sailingId] = await getCruiseSailingDetail(line.sailingId, {
            guests: line.guests,
          }).catch(() => null);
          break;
        default:
          break;
      }
    }),
  );

  return {
    activityDetails,
    propertyDetails,
    flightDetails,
    vehicleDetails,
    cruiseDetails,
  };
}

export type {
  ActivityDetail,
  CruiseSailingDetail,
  FlightDetail,
  PropertyDetail,
  VehicleDetail,
};
