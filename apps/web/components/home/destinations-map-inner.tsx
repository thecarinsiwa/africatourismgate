'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { CircleMarker, Map as LeafletMap } from 'leaflet';
import type { DestinationMapMarker } from './destinations-map-section';

type MapFocus = {
  latitude: number;
  longitude: number;
  zoom?: number;
};

type DestinationsMapInnerProps = {
  markers: DestinationMapMarker[];
  ariaLabel: string;
  focus?: MapFocus | null;
  /** When true, fit the viewport to current markers (used after products load). */
  fitToMarkers?: boolean;
  fitMaxZoom?: number;
  onDestinationClick?: (marker: DestinationMapMarker) => void;
};

export function DestinationsMapInner({
  markers,
  ariaLabel,
  focus = null,
  fitToMarkers = true,
  fitMaxZoom = 8,
  onDestinationClick,
}: DestinationsMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<CircleMarker[]>([]);
  const onDestinationClickRef = useRef(onDestinationClick);
  const lastFocusKeyRef = useRef<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  onDestinationClickRef.current = onDestinationClick;

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

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      setMapReady(false);
      for (const marker of markerLayerRef.current) {
        marker.remove();
      }
      markerLayerRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) {
      return;
    }

    void import('leaflet').then((L) => {
      renderMarkers(L, map, markers, markerLayerRef, onDestinationClickRef, {
        fitToMarkers,
        fitMaxZoom,
      });
    });
  }, [markers, mapReady, fitToMarkers, fitMaxZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) {
      return;
    }

    if (!focus) {
      lastFocusKeyRef.current = null;
      return;
    }

    const key = `${focus.latitude},${focus.longitude},${focus.zoom ?? 12}`;
    if (lastFocusKeyRef.current === key) {
      return;
    }
    lastFocusKeyRef.current = key;

    map.flyTo([focus.latitude, focus.longitude], focus.zoom ?? 12, {
      duration: 0.85,
    });
  }, [focus, mapReady]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full rounded-xl sm:h-[480px]"
      role="application"
      aria-label={ariaLabel}
    />
  );
}

function renderMarkers(
  L: typeof import('leaflet'),
  map: LeafletMap,
  markers: DestinationMapMarker[],
  markerLayerRef: MutableRefObject<CircleMarker[]>,
  onDestinationClickRef: MutableRefObject<
    ((marker: DestinationMapMarker) => void) | undefined
  >,
  options: { fitToMarkers: boolean; fitMaxZoom: number },
) {
  for (const marker of markerLayerRef.current) {
    marker.remove();
  }
  markerLayerRef.current = [];

  if (!markers.length) {
    return;
  }

  const bounds = L.latLngBounds([]);

  for (const item of markers) {
    const latLng = L.latLng(item.latitude, item.longitude);
    bounds.extend(latLng);

    const isDestination = item.kind === 'destination';
    const marker = L.circleMarker(latLng, {
      radius: isDestination ? 10 : 7,
      color: '#ffffff',
      weight: 2,
      fillColor: item.fillColor,
      fillOpacity: 0.95,
    }).addTo(map);

    const popupHtml = `
      <div style="min-width:180px;font-family:inherit;line-height:1.4">
        <strong style="display:block;margin-bottom:4px;font-size:14px">${escapeHtml(item.title)}</strong>
        <span style="display:block;font-size:12px;color:#666;margin-bottom:8px">${escapeHtml(item.subtitle)}</span>
        <a href="${escapeHtml(item.href)}" style="font-size:12px;font-weight:600;color:var(--atg-primary,#c8102e);text-decoration:underline">${escapeHtml(item.viewLabel)}</a>
      </div>
    `;

    marker.bindPopup(popupHtml, { closeButton: true, maxWidth: 260 });

    if (isDestination) {
      marker.on('click', () => {
        onDestinationClickRef.current?.(item);
      });
    } else {
      marker.on('click', () => {
        marker.openPopup();
      });
    }

    markerLayerRef.current.push(marker);
  }

  if (!options.fitToMarkers) {
    return;
  }

  if (markers.length === 1) {
    map.setView(
      [markers[0].latitude, markers[0].longitude],
      Math.min(options.fitMaxZoom, 11),
    );
    return;
  }

  map.fitBounds(bounds, {
    padding: [48, 48],
    maxZoom: options.fitMaxZoom,
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
