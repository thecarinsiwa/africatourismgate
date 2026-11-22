export type ItineraryMapPoint = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  description?: string | null;
};

/** Optional product icon shown on the route polyline. */
export type ItineraryRouteIcon = 'vehicle';
