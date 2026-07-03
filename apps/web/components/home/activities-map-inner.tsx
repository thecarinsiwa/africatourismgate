'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { CircleMarker, Map as LeafletMap } from 'leaflet';
import type { ActivityMapMarker } from './activities-map-section';

type ActivitiesMapInnerProps = {
  markers: ActivityMapMarker[];
  ariaLabel: string;
};

export function ActivitiesMapInner({ markers, ariaLabel }: ActivitiesMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<CircleMarker[]>([]);
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
      renderMarkers(L, map, markers, markerLayerRef);
    });
  }, [markers, mapReady]);

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
  markers: ActivityMapMarker[],
  markerLayerRef: MutableRefObject<CircleMarker[]>,
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

    const marker = L.circleMarker(latLng, {
      radius: 9,
      color: '#ffffff',
      weight: 2,
      fillColor: 'var(--atg-primary, #c8102e)',
      fillOpacity: 0.95,
    }).addTo(map);

    const popupHtml = `
      <div style="min-width:180px;font-family:inherit;line-height:1.4">
        <strong style="display:block;margin-bottom:4px;font-size:14px">${escapeHtml(item.title)}</strong>
        <span style="display:block;font-size:12px;color:#666;margin-bottom:6px">${escapeHtml(item.destination)}</span>
        <span style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">${escapeHtml(item.priceLabel)}</span>
        ${item.nextDateLabel ? `<span style="display:block;font-size:12px;color:#666;margin-bottom:8px">${escapeHtml(item.nextDateLabel)}</span>` : ''}
        <a href="${escapeHtml(item.href)}" style="font-size:12px;font-weight:600;color:var(--atg-primary,#c8102e);text-decoration:underline">${escapeHtml(item.viewLabel)}</a>
      </div>
    `;

    marker.bindPopup(popupHtml, { closeButton: true, maxWidth: 260 });
    markerLayerRef.current.push(marker);
  }

  if (markers.length === 1) {
    map.setView([markers[0].latitude, markers[0].longitude], 8);
    return;
  }

  map.fitBounds(bounds, { padding: [48, 48], maxZoom: 8 });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
