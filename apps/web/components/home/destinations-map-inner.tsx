'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Layer, Map as LeafletMap } from 'leaflet';
import type {
  DestinationMapMarker,
  DestinationMapMarkerKind,
} from './destinations-map-section';

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
  const markerLayerRef = useRef<Layer[]>([]);
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
  markerLayerRef: MutableRefObject<Layer[]>,
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
    const icon = createProductMarkerIcon(L, item.kind, item.fillColor);
    const marker = L.marker(latLng, {
      icon,
      title: item.title,
      zIndexOffset: isDestination ? 100 : 200,
    }).addTo(map);

    const kindBadge = item.kindLabel
      ? `<span style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:${escapeHtml(item.fillColor)};color:#fff;font-size:10px;font-weight:700;letter-spacing:.02em;text-transform:uppercase">${escapeHtml(item.kindLabel)}</span>`
      : '';

    const popupHtml = `
      <div style="min-width:180px;font-family:inherit;line-height:1.4">
        ${kindBadge}
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
    padding: [56, 56],
    maxZoom: options.fitMaxZoom,
  });
}

function createProductMarkerIcon(
  L: typeof import('leaflet'),
  kind: DestinationMapMarkerKind,
  fillColor: string,
): import('leaflet').DivIcon {
  const glyph = markerGlyph(kind);
  const size = kind === 'destination' ? 34 : 36;

  return L.divIcon({
    className: 'atg-destinations-map-marker',
    html: `
      <span style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${fillColor};
        border:2px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.28);
        color:#fff;
      " aria-hidden="true">${glyph}</span>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
}

function markerGlyph(kind: DestinationMapMarkerKind): string {
  if (kind === 'hotel') {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-5h6v5"/><path d="M9 10h.01"/><path d="M15 10h.01"/></svg>`;
  }
  if (kind === 'activity') {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/></svg>`;
  }
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
