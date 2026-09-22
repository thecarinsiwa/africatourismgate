import type { DivIcon, Icon, IconOptions } from 'leaflet';

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

/** Distinct pin for points of interest (teal) vs destination center (default blue). */
export function createLeafletPoiMarkerIcon(L: typeof import('leaflet')): DivIcon {
  return L.divIcon({
    className: 'atg-poi-marker',
    html: `<span style="
      display:block;
      width:14px;
      height:14px;
      margin:7px;
      border-radius:9999px;
      background:#0f766e;
      border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.35);
    "></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}
