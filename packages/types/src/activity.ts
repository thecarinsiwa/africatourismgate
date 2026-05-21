export interface ActivityProvider {
  id: string;
  destinationId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityProviderRequest {
  destinationId: string;
  name: string;
}

export type UpdateActivityProviderRequest = Partial<CreateActivityProviderRequest>;

export interface ActivityProvidersListQuery {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
}

export interface Activity {
  id: string;
  providerId: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  priceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityRequest {
  providerId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  priceCents: number;
  currency: string;
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export interface ActivitiesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  providerId?: string;
  destinationId?: string;
}

export interface ActivitySchedule {
  id: string;
  activityId: string;
  startDatetime: string;
  capacity: number;
  bookedCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityScheduleRequest {
  activityId: string;
  startDatetime: string;
  capacity: number;
}

export type UpdateActivityScheduleRequest = Partial<
  Omit<CreateActivityScheduleRequest, 'activityId'>
>;

export interface ActivitySchedulesListQuery {
  page?: number;
  limit?: number;
  activityId?: string;
  destinationId?: string;
}
