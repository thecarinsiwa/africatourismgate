import type { Icon, IconOptions } from 'leaflet';

/** Fixes broken default marker images under Next.js / bundlers. */
export function createLeafletMarkerIcon(L: typeof import('leaflet')): Icon {
  // Avoid mutating Icon.Default repeatedly; return a concrete icon instance.
  const options: IconOptions = {
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  };
  return new L.Icon(options);
}
