'use client';

import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import type { ItineraryMapPoint } from '../../lib/maps/types';

type ItineraryMapInnerProps = {
  points: ItineraryMapPoint[];
  ariaLabel: string;
  className?: string;
};

const DEFAULT_HEIGHT_CLASS = 'h-[320px] w-full sm:h-[400px]';

export function ItineraryMapInner({
  points,
  ariaLabel,
  className,
}: ItineraryMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

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

      const map = L.map(containerRef.current!, {
        scrollWheelZoom: false,
      }).setView([2, 20], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!mapReady || !map || !layerGroup) {
      return;
    }

    void import('leaflet').then((L) => {
      renderItinerary(L, map, layerGroup, points);
    });
  }, [points, mapReady]);

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
  L: typeof import('leaflet'),
  map: LeafletMap,
  layerGroup: import('leaflet').LayerGroup,
  points: ItineraryMapPoint[],
) {
  layerGroup.clearLayers();

  if (!points.length) {
    return;
  }

  const bounds = L.latLngBounds([]);
  const latLngs: import('leaflet').LatLngExpression[] = [];

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const latLng = L.latLng(point.latitude, point.longitude);
    bounds.extend(latLng);
    latLngs.push(latLng);

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

  if (latLngs.length >= 2) {
    L.polyline(latLngs, {
      color: 'var(--atg-primary, #c8102e)',
      weight: 3,
      opacity: 0.85,
      lineJoin: 'round',
    }).addTo(layerGroup);
  }

  if (points.length === 1) {
    map.setView([points[0].latitude, points[0].longitude], 11);
    return;
  }

  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
}

function createNumberedMarkerIcon(
  L: typeof import('leaflet'),
  order: number,
): import('leaflet').DivIcon {
  return L.divIcon({
    className: 'atg-itinerary-marker',
    html: `<span class="atg-itinerary-marker__badge" aria-hidden="true">${order}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
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
