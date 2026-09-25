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
  className?: string;
};

export function DestinationsMapInner({
  markers,
  ariaLabel,
  focus = null,
  fitToMarkers = true,
  fitMaxZoom = 8,
  onDestinationClick,
  className = 'h-[min(62vh,420px)] w-full sm:h-[460px] lg:h-[540px]',
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
    let resizeObserver: ResizeObserver | null = null;

    const invalidate = () => {
      mapRef.current?.invalidateSize({ animate: false });
    };

    void import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      const map = L.map(containerRef.current!, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([2, 20], 4);

      map.zoomControl.setPosition('topright');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);

      requestAnimationFrame(invalidate);

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          invalidate();
        });
        resizeObserver.observe(containerRef.current!);
      }

      window.addEventListener('orientationchange', invalidate);
    });

    return () => {
      cancelled = true;
      setMapReady(false);
      resizeObserver?.disconnect();
      window.removeEventListener('orientationchange', invalidate);
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
      map.invalidateSize({ animate: false });
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

    map.invalidateSize({ animate: false });
    map.flyTo([focus.latitude, focus.longitude], focus.zoom ?? 12, {
      duration: 0.85,
    });
  }, [focus, mapReady]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl ${className}`}
      role="application"
      aria-label={ariaLabel}
    />
  );
}

function getFitPadding(): [number, number] {
  if (typeof window === 'undefined') {
    return [48, 48];
  }
  return window.matchMedia('(min-width: 640px)').matches ? [64, 64] : [40, 72];
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
  const isCompact =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 639px)').matches;

  for (const item of markers) {
    const latLng = L.latLng(item.latitude, item.longitude);
    bounds.extend(latLng);

    const isDestination = item.kind === 'destination';
    const icon = createProductMarkerIcon(L, item.kind, item.fillColor, isCompact);
    const marker = L.marker(latLng, {
      icon,
      title: item.title,
      zIndexOffset: isDestination ? 100 : 200,
    }).addTo(map);

    const kindBadge = item.kindLabel
      ? `<span style="display:inline-block;margin-bottom:4px;padding:1px 7px;border-radius:999px;background:${escapeHtml(item.fillColor)};color:#fff;font-size:9px;font-weight:700;letter-spacing:.03em;text-transform:uppercase">${escapeHtml(item.kindLabel)}</span>`
      : '';

    const popupHtml = `
      <div class="atg-destinations-map-popup" style="min-width:0;max-width:min(200px,72vw);font-family:inherit;line-height:1.3">
        ${kindBadge}
        <strong style="display:block;margin-bottom:2px;font-size:13px">${escapeHtml(item.title)}</strong>
        <span style="display:block;font-size:11px;color:#666;margin-bottom:6px">${escapeHtml(item.subtitle)}</span>
        <a href="${escapeHtml(item.href)}" style="font-size:11px;font-weight:600;color:var(--atg-primary,#c8102e);text-decoration:underline">${escapeHtml(item.viewLabel)}</a>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      closeButton: true,
      maxWidth: isCompact ? 200 : 220,
      autoPanPaddingTopLeft: isCompact ? [12, 56] : [24, 64],
      autoPanPaddingBottomRight: isCompact ? [12, 56] : [24, 64],
      className: 'atg-destinations-map-popup-wrap',
    });

    if (isDestination) {
      marker.on('click', () => {
        onDestinationClickRef.current?.(item);
      });
    } else {
      marker.on('click', () => {
        const productZoom = isCompact ? 14 : 15;
        const currentZoom = map.getZoom();
        if (currentZoom < productZoom - 0.4) {
          map.flyTo(latLng, productZoom, { duration: 0.7 });
          map.once('moveend', () => {
            marker.openPopup();
          });
        } else {
          map.panTo(latLng, { animate: true, duration: 0.35 });
          marker.openPopup();
        }
      });
    }

    markerLayerRef.current.push(marker);
  }

  if (!options.fitToMarkers) {
    return;
  }

  const padding = getFitPadding();

  if (markers.length === 1) {
    map.setView(
      [markers[0].latitude, markers[0].longitude],
      Math.min(options.fitMaxZoom, isCompact ? 10 : 11),
    );
    return;
  }

  map.fitBounds(bounds, {
    padding,
    maxZoom: options.fitMaxZoom,
  });
}

function createProductMarkerIcon(
  L: typeof import('leaflet'),
  kind: DestinationMapMarkerKind,
  fillColor: string,
  isCompact: boolean,
): import('leaflet').DivIcon {
  const glyph = markerGlyph(kind, isCompact);
  const base = kind === 'destination' ? 40 : 44;
  const size = isCompact ? base - 8 : base;

  return L.divIcon({
    className: 'atg-destinations-map-marker',
    html: `
      <span class="atg-destinations-map-marker__pin" style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${fillColor};
        border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(0,0,0,.18), 0 4px 14px rgba(0,0,0,.4);
        color:#fff;
      " aria-hidden="true">${glyph}</span>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
}

function markerGlyph(kind: DestinationMapMarkerKind, isCompact: boolean): string {
  const dim = isCompact ? 16 : 20;
  if (kind === 'hotel') {
    return `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-5h6v5"/><path d="M9 10h.01"/><path d="M15 10h.01"/></svg>`;
  }
  if (kind === 'activity') {
    return `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/></svg>`;
  }
  const pin = isCompact ? 14 : 18;
  return `<svg width="${pin}" height="${pin}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
