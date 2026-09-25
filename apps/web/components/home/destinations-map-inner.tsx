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
  markerId?: string;
};

type DestinationsMapInnerProps = {
  markers: DestinationMapMarker[];
  ariaLabel: string;
  focus?: MapFocus | null;
  /** When true, fit the viewport to current markers (used after products load). */
  fitToMarkers?: boolean;
  fitMaxZoom?: number;
  onDestinationClick?: (marker: DestinationMapMarker) => void;
  highlightId?: string | null;
  className?: string;
};

export function DestinationsMapInner({
  markers,
  ariaLabel,
  focus = null,
  fitToMarkers = true,
  fitMaxZoom = 8,
  onDestinationClick,
  highlightId = null,
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
        attributionControl: false,
      }).setView([2, 20], 4);

      map.zoomControl.setPosition('topright');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
        highlightId,
      });
    });
  }, [markers, mapReady, fitToMarkers, fitMaxZoom, highlightId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) {
      return;
    }

    if (!focus) {
      lastFocusKeyRef.current = null;
      return;
    }

    const key = `${focus.latitude},${focus.longitude},${focus.zoom ?? 12},${focus.markerId ?? ''}`;
    if (lastFocusKeyRef.current === key) {
      return;
    }
    lastFocusKeyRef.current = key;

    map.invalidateSize({ animate: false });
    map.flyTo([focus.latitude, focus.longitude], focus.zoom ?? 12, {
      duration: 0.7,
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
  return window.matchMedia('(min-width: 640px)').matches ? [56, 72] : [28, 64];
}

function renderMarkers(
  L: typeof import('leaflet'),
  map: LeafletMap,
  markers: DestinationMapMarker[],
  markerLayerRef: MutableRefObject<Layer[]>,
  onDestinationClickRef: MutableRefObject<
    ((marker: DestinationMapMarker) => void) | undefined
  >,
  options: { fitToMarkers: boolean; fitMaxZoom: number; highlightId: string | null },
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
    const isHighlighted = options.highlightId === item.id;

    const icon = createProductMarkerIcon(
      L,
      item.kind,
      item.fillColor,
      isCompact,
      isHighlighted,
      isDestination
        ? {
            countryLabel:
              item.count != null ? item.subtitle : item.title,
            countryCode: item.countryCode,
            count: item.count,
          }
        : undefined,
    );
    const marker = L.marker(latLng, {
      icon,
      title: isDestination
        ? `${item.title} · ${item.subtitle}${item.count != null ? ` (${item.count})` : ''}`
        : item.title,
      zIndexOffset: isHighlighted ? 400 : isDestination ? 100 : 200,
    }).addTo(map);

    const flagHtml = isDestination
      ? countryFlagImgHtml(item.countryCode, 14, 10)
      : '';
    const kindBadge = item.kindLabel
      ? `<span style="display:inline-flex;align-items:center;gap:5px;margin-bottom:4px;padding:1px 7px;border-radius:999px;background:${escapeHtml(item.fillColor)};color:#fff;font-size:9px;font-weight:700;letter-spacing:.03em;text-transform:uppercase">${flagHtml}${escapeHtml(item.kindLabel)}</span>`
      : '';

    const countryLine = isDestination
      ? `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#666;margin-bottom:6px">${countryFlagImgHtml(item.countryCode, 18, 13)}<span>${escapeHtml(item.subtitle)}${item.count != null && item.count > 0 ? ` · ${item.count}` : ''}</span></span>`
      : `<span style="display:block;font-size:11px;color:#666;margin-bottom:6px">${escapeHtml(item.subtitle)}</span>`;

    const popupHtml = `
      <div class="atg-destinations-map-popup" style="min-width:0;max-width:min(200px,72vw);font-family:inherit;line-height:1.3">
        ${kindBadge}
        <strong style="display:block;margin-bottom:2px;font-size:13px">${escapeHtml(item.title)}</strong>
        ${countryLine}
        <a href="${escapeHtml(item.href)}" style="font-size:11px;font-weight:600;color:var(--atg-primary,#c8102e);text-decoration:underline">${escapeHtml(item.viewLabel)}</a>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      closeButton: true,
      maxWidth: isCompact ? 200 : 220,
      autoPanPaddingTopLeft: isCompact ? [12, 56] : [24, 64],
      autoPanPaddingBottomRight: isCompact ? [12, 72] : [24, 80],
      className: 'atg-destinations-map-popup-wrap',
    });

    marker.on('click', () => {
      onDestinationClickRef.current?.(item);
      if (!isDestination) {
        marker.openPopup();
      }
    });

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

function normalizeCountryCode(countryCode?: string): string | null {
  const code = countryCode?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Flag image (flagcdn) — works reliably across platforms unlike emoji flags. */
function countryFlagImgHtml(
  countryCode: string | undefined,
  width: number,
  height: number,
): string {
  const code = normalizeCountryCode(countryCode);
  if (!code) {
    return '';
  }
  const src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
  return `<img src="${src}" alt="" width="${width}" height="${height}" style="width:${width}px;height:${height}px;object-fit:cover;border-radius:2px;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.12)" loading="lazy" decoding="async" />`;
}

function createProductMarkerIcon(
  L: typeof import('leaflet'),
  kind: DestinationMapMarkerKind,
  fillColor: string,
  isCompact: boolean,
  isHighlighted: boolean,
  destinationMeta?: {
    countryLabel: string;
    countryCode?: string;
    count?: number;
  },
): import('leaflet').DivIcon {
  if (kind === 'destination') {
    return createDestinationCountryIcon(
      L,
      destinationMeta?.countryLabel?.trim() || '·',
      destinationMeta?.countryCode,
      fillColor,
      isCompact,
      isHighlighted,
      destinationMeta?.count,
    );
  }

  const glyph = markerGlyph(kind, isCompact);
  const base = 44;
  const size = (isCompact ? base - 8 : base) + (isHighlighted ? 4 : 0);

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
        box-shadow:0 0 0 ${isHighlighted ? '3px rgba(200,16,46,.35), ' : ''}2px rgba(0,0,0,.18), 0 4px 14px rgba(0,0,0,.4);
        color:#fff;
        transform:scale(${isHighlighted ? 1.06 : 1});
      " aria-hidden="true">${glyph}</span>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
}

/** Flag + country/destination label, with optional destination count badge. */
function createDestinationCountryIcon(
  L: typeof import('leaflet'),
  countryLabel: string,
  countryCode: string | undefined,
  _fillColor: string,
  isCompact: boolean,
  isHighlighted: boolean,
  count?: number,
): import('leaflet').DivIcon {
  const label = escapeHtml(countryLabel);
  const width = isCompact ? 96 : 112;
  const height = isCompact ? 52 : 58;
  const flagW = isCompact ? 28 : 34;
  const flagH = Math.round(flagW * 0.72);
  const fontSize = countryLabel.length > 14 ? (isCompact ? 9 : 10) : isCompact ? 10 : 11;
  const flagHtml = countryFlagImgHtml(countryCode, flagW, flagH);
  const code = normalizeCountryCode(countryCode);
  const fallbackCode = code
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:${flagW}px;height:${flagH}px;border-radius:2px;background:#fff;font-size:10px;font-weight:800;color:#111;box-shadow:0 1px 3px rgba(0,0,0,.25)">${escapeHtml(code)}</span>`
    : '';
  const scale = isHighlighted ? 1.06 : 1;
  const showCount = typeof count === 'number' && count > 0;
  const countBadge = showCount
    ? `<span style="
        position:absolute;
        top:-6px;
        right:-8px;
        min-width:18px;
        height:18px;
        padding:0 5px;
        border-radius:999px;
        background:#111;
        color:#fff;
        font-size:10px;
        font-weight:800;
        line-height:18px;
        text-align:center;
        box-shadow:0 0 0 2px #fff;
      ">${count}</span>`
    : '';

  return L.divIcon({
    className: 'atg-destinations-map-marker',
    html: `
      <span class="atg-destinations-map-marker__country" style="
        display:inline-flex;
        flex-direction:column;
        align-items:center;
        justify-content:flex-start;
        gap:4px;
        box-sizing:border-box;
        width:${width}px;
        height:${height}px;
        transform:scale(${scale});
        filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));
      " aria-hidden="true">
        <span style="position:relative;display:inline-flex;line-height:0">
          ${flagHtml || fallbackCode}
          ${countBadge}
        </span>
        <span style="
          max-width:100%;
          padding:1px 4px;
          border-radius:4px;
          background:rgba(255,255,255,.92);
          color:#111;
          font-size:${fontSize}px;
          font-weight:700;
          line-height:1.15;
          text-align:center;
          overflow:hidden;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          word-break:break-word;
        ">${label}</span>
      </span>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
    popupAnchor: [0, -(height / 2) - 4],
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
