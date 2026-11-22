import { createApiClient } from '@africatourismgate/api-client';
import type {
  CreateVehicleTripRequest,
  EnsureVehicleTripSeatsRequest,
  JoinVehicleTripRequest,
  PaginatedResponse,
  UpdateVehicleTripRequest,
  VehicleTrip,
  VehicleTripsListQuery,
} from '@africatourismgate/types';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

function createPublicClient() {
  return createApiClient({ baseUrl: getApiBaseUrl() });
}

function createAuthClient(accessToken: string) {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    accessToken,
  });
}

export function listPublicVehicleTrips(
  query?: VehicleTripsListQuery,
): Promise<PaginatedResponse<VehicleTrip>> {
  return createPublicClient().listPublicVehicleTrips(query);
}

export function getPublicVehicleTrip(id: string): Promise<VehicleTrip> {
  return createPublicClient().getPublicVehicleTrip(id);
}

export function createPublicVehicleTrip(
  accessToken: string,
  body: CreateVehicleTripRequest,
): Promise<VehicleTrip> {
  return createAuthClient(accessToken).createPublicVehicleTrip(body);
}

export function joinPublicVehicleTrip(
  accessToken: string,
  id: string,
  body: JoinVehicleTripRequest = {},
): Promise<VehicleTrip> {
  return createAuthClient(accessToken).joinPublicVehicleTrip(id, body);
}

export function ensurePublicVehicleTripSeats(
  accessToken: string,
  id: string,
  body: EnsureVehicleTripSeatsRequest,
): Promise<VehicleTrip> {
  return createAuthClient(accessToken).ensurePublicVehicleTripSeats(id, body);
}

export function updatePublicVehicleTrip(
  accessToken: string,
  id: string,
  body: UpdateVehicleTripRequest,
): Promise<VehicleTrip> {
  return createAuthClient(accessToken).updatePublicVehicleTrip(id, body);
}
