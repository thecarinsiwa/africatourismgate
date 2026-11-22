'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import {
  fetchOsrmDrivingRoute,
  straightLineLatLngs,
  type LatLngTuple,
} from '../../lib/maps/osrm-route';
import {
  formatTravelDistanceMeters,
  formatTravelDurationSeconds,
  formatTravelRouteBadge,
  type TravelDurationLabels,
  type TravelRouteStatsLabels,
} from '../../lib/maps/travel-duration';
import type { ItineraryMapPoint, ItineraryRouteIcon } from '../../lib/maps/types';

type ItineraryMapInnerProps = {
  points: ItineraryMapPoint[];
  ariaLabel: string;
  className?: string;
  /** When set, shows estimated driving time / distance on the route. */
  durationLabels?: TravelDurationLabels;
  onRouteStatsChange?: (stats: TravelRouteStatsLabels | null) => void;
  /** Optional product icon on the route (e.g. car for vehicle trips). */
  routeIcon?: ItineraryRouteIcon;
};

type LeafletModule = typeof import('leaflet');

type RouteState = {
  path: LatLngTuple[] | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

const DEFAULT_HEIGHT_CLASS = 'h-[320px] w-full sm:h-[400px]';
// Hex only - Leaflet sets stroke as an SVG attribute; CSS vars are unreliable there.
const ROUTE_STYLE = {
  color: '#c8102e',
  weight: 4,
  opacity: 0.9,
  lineJoin: 'round' as const,
  // Keep OSRM geometry intact (Leaflet default smoothFactor=1 simplifies the path).
  smoothFactor: 0,
};

export function ItineraryMapInner({
  points,
  ariaLabel,
  className,
  durationLabels,
  onRouteStatsChange,
  routeIcon,
}: ItineraryMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const onRouteStatsChangeRef = useRef(onRouteStatsChange);
  onRouteStatsChangeRef.current = onRouteStatsChange;
  const [mapReady, setMapReady] = useState(false);
  const [route, setRoute] = useState<RouteState>({
    path: null,
    durationSeconds: null,
    distanceMeters: null,
  });

  const pointsKey = useMemo(
    () =>
      points
        .map((p) => `${p.id}:${p.latitude}:${p.longitude}`)
        .join('|'),
    [points],
  );
  // Stable snapshot for effects: only changes when coordinates/ids change.
  const routePoints = useMemo(() => points, [pointsKey]);
  const latestPointsKeyRef = useRef(pointsKey);
  latestPointsKeyRef.current = pointsKey;

  // Fetch road geometry independently of the Leaflet mount lifecycle.
  useEffect(() => {
    if (routePoints.length < 2) {
      setRoute({ path: null, durationSeconds: null, distanceMeters: null });
      onRouteStatsChangeRef.current?.(null);
      return;
    }

    const requestKey = pointsKey;
    setRoute({
      path: straightLineLatLngs(routePoints),
      durationSeconds: null,
      distanceMeters: null,
    });
    onRouteStatsChangeRef.current?.(null);

    void fetchOsrmDrivingRoute(routePoints).then((routed) => {
      if (!routed?.path.length) return;
      if (latestPointsKeyRef.current !== requestKey) return;
      setRoute({
        path: routed.path,
        durationSeconds: routed.durationSeconds,
        distanceMeters: routed.distanceMeters,
      });
      if (durationLabels) {
        onRouteStatsChangeRef.current?.({
          durationLabel: formatTravelDurationSeconds(
            routed.durationSeconds,
            durationLabels,
          ),
          distanceLabel: formatTravelDistanceMeters(routed.distanceMeters),
        });
      }
    });
  }, [pointsKey, routePoints, durationLabels]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    let cancelled = false;

    void import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = L;
      const map = L.map(containerRef.current!, {
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([2, 20], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      setMapReady(false);
      layerGroupRef.current?.clearLayers();
      layerGroupRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!mapReady || !L || !map || !layerGroup) {
      return;
    }

    // Sync - do not re-import leaflet (async then() races overwrite the OSRM path).
    renderItinerary(L, map, layerGroup, points, route, durationLabels, routeIcon);
  }, [points, pointsKey, route, mapReady, durationLabels, routeIcon]);

  return (
    <div
      ref={containerRef}
      className={className ?? DEFAULT_HEIGHT_CLASS}
      role="application"
      aria-label={ariaLabel}
    />
  );
}

function renderItinerary(
  L: LeafletModule,
  map: LeafletMap,
  layerGroup: LayerGroup,
  points: ItineraryMapPoint[],
  route: RouteState,
  durationLabels: TravelDurationLabels | undefined,
  routeIcon: ItineraryRouteIcon | undefined,
) {
  layerGroup.clearLayers();

  if (!points.length) {
    return;
  }

  const bounds = L.latLngBounds([]);

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const latLng = L.latLng(point.latitude, point.longitude);
    bounds.extend(latLng);

    const marker = L.marker(latLng, {
      icon: createNumberedMarkerIcon(L, index + 1),
    });

    const popupLines = [
      `<strong style="display:block;margin-bottom:4px;font-size:14px">${escapeHtml(point.label)}</strong>`,
    ];
    if (point.description?.trim()) {
      popupLines.push(
        `<span style="display:block;font-size:12px;color:#666;line-height:1.4">${escapeHtml(point.description)}</span>`,
      );
    }

    marker.bindPopup(
      `<div style="min-width:160px;font-family:inherit;line-height:1.4">${popupLines.join('')}</div>`,
      { closeButton: true, maxWidth: 280 },
    );

    marker.addTo(layerGroup);
  }

  if (points.length >= 2) {
    const path = route.path ?? straightLineLatLngs(points);
    const isPreview =
      route.durationSeconds == null ||
      !route.path ||
      (route.path.length === points.length &&
        route.path.every(
          (coord, i) =>
            coord[0] === points[i].latitude && coord[1] === points[i].longitude,
        ));

    L.polyline(path, {
      ...ROUTE_STYLE,
      ...(isPreview ? { opacity: 0.35, dashArray: '6 8' } : {}),
    }).addTo(layerGroup);

    if (!isPreview) {
      const mid = path[Math.floor(path.length / 2)] ?? path[0];
      const badgeText = durationLabels
        ? formatTravelRouteBadge({
            durationLabel: formatTravelDurationSeconds(
              route.durationSeconds,
              durationLabels,
            ),
            distanceLabel: formatTravelDistanceMeters(route.distanceMeters),
          })
        : null;

      if (badgeText) {
        L.marker(mid, {
          icon: createDurationBadgeIcon(L, badgeText, routeIcon === 'vehicle'),
          interactive: false,
          keyboard: false,
          zIndexOffset: 250,
        }).addTo(layerGroup);
      } else if (routeIcon === 'vehicle') {
        L.marker(mid, {
          icon: createVehicleMarkerIcon(L),
          interactive: false,
          keyboard: false,
          zIndexOffset: 200,
        }).addTo(layerGroup);
      }
    }

    for (const [lat, lng] of path) {
      bounds.extend([lat, lng]);
    }
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    return;
  }

  map.setView([points[0].latitude, points[0].longitude], 11);
}

const PIN_WIDTH = 28;
const PIN_HEIGHT = 36;

function createNumberedMarkerIcon(
  L: LeafletModule,
  order: number,
): import('leaflet').DivIcon {
  const label = escapeHtml(String(order));
  return L.divIcon({
    className: 'atg-itinerary-marker',
    html: `<span class="atg-itinerary-marker__pin" aria-hidden="true">
      <svg class="atg-itinerary-marker__svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
        <path class="atg-itinerary-marker__shape" d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"/>
        <text class="atg-itinerary-marker__label" x="18" y="20" text-anchor="middle" dominant-baseline="central">${label}</text>
      </svg>
    </span>`,
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    // Tip of the pin sits on the coordinates.
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
    popupAnchor: [0, -PIN_HEIGHT + 6],
  });
}

const VEHICLE_ICON_SVG = `<svg class="atg-itinerary-vehicle__svg" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;

const VEHICLE_ICON_SIZE = 34;

function createVehicleMarkerIcon(L: LeafletModule): import('leaflet').DivIcon {
  return L.divIcon({
    className: 'atg-itinerary-vehicle',
    html: `<span class="atg-itinerary-vehicle__pin" aria-hidden="true">${VEHICLE_ICON_SVG}</span>`,
    iconSize: [VEHICLE_ICON_SIZE, VEHICLE_ICON_SIZE],
    iconAnchor: [VEHICLE_ICON_SIZE / 2, VEHICLE_ICON_SIZE / 2],
  });
}

function createDurationBadgeIcon(
  L: LeafletModule,
  durationText: string,
  withVehicleIcon = false,
): import('leaflet').DivIcon {
  const label = escapeHtml(durationText);
  const icon = withVehicleIcon
    ? `<span class="atg-itinerary-duration__icon">${VEHICLE_ICON_SVG}</span>`
    : '';
  return L.divIcon({
    className: 'atg-itinerary-duration',
    html: `<span class="atg-itinerary-duration__badge" aria-hidden="true">${icon}<span class="atg-itinerary-duration__text">${label}</span></span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
