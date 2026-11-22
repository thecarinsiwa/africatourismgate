'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import {
  fetchOsrmDrivingRoute,
  straightLineLatLngs,
  type LatLngTuple,
} from '../../lib/maps/osrm-route';
import type { ItineraryMapPoint } from '../../lib/maps/types';

type ItineraryMapInnerProps = {
  points: ItineraryMapPoint[];
  ariaLabel: string;
  className?: string;
};

type LeafletModule = typeof import('leaflet');

const DEFAULT_HEIGHT_CLASS = 'h-[320px] w-full sm:h-[400px]';
// Hex only — Leaflet sets stroke as an SVG attribute; CSS vars are unreliable there.
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
}: ItineraryMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [routePath, setRoutePath] = useState<LatLngTuple[] | null>(null);

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
      setRoutePath(null);
      return;
    }

    const requestKey = pointsKey;
    setRoutePath(straightLineLatLngs(routePoints));

    void fetchOsrmDrivingRoute(routePoints).then((routed) => {
      if (!routed?.length) return;
      if (latestPointsKeyRef.current !== requestKey) return;
      setRoutePath(routed);
    });
  }, [pointsKey, routePoints]);

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

    // Sync — do not re-import leaflet (async then() races overwrite the OSRM path).
    renderItinerary(L, map, layerGroup, points, routePath);
  }, [points, pointsKey, routePath, mapReady]);

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
  routePath: LatLngTuple[] | null,
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
    const path = routePath ?? straightLineLatLngs(points);
    const isPreview =
      !routePath ||
      (routePath.length === points.length &&
        routePath.every(
          (coord, i) =>
            coord[0] === points[i].latitude && coord[1] === points[i].longitude,
        ));

    L.polyline(path, {
      ...ROUTE_STYLE,
      ...(isPreview ? { opacity: 0.35, dashArray: '6 8' } : {}),
    }).addTo(layerGroup);

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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
