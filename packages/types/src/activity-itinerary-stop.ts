export interface ActivityItineraryStop {
  id: string;
  activityId: string;
  stopOrder: number;
  name: string;
  latitude: string;
  longitude: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityItineraryStopRequest {
  activityId: string;
  stopOrder: number;
  name: string;
  latitude: number | string;
  longitude: number | string;
  description?: string | null;
}

export type UpdateActivityItineraryStopRequest = Partial<
  Omit<CreateActivityItineraryStopRequest, 'activityId'>
>;

export interface ActivityItineraryStopsListQuery {
  page?: number;
  limit?: number;
  activityId?: string;
}
