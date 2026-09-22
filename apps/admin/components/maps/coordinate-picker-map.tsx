'use client';

import { cn } from '@africatourismgate/ui';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { fetchCountryBoundaryGeoJson } from '../../lib/country-boundary-geojson';
import {
  hasValidDestinationCoords,
  parseDestinationCoord,
} from '../../lib/destination-coords';
import { getIsoCountryLabel } from '../../lib/iso-countries';
import {
  createLeafletMarkerIcon,
  createLeafletPoiMarkerIcon,
} from '../../lib/leaflet-marker-icon';

type ContextPoi = {
  id: string;
  name: string;
  latitude: string | number | null | undefined;
  longitude: string | number | null | undefined;
};

type CoordinatePickerMapProps = {
  latitude: string;
  longitude: string;
  onCoordinateChange: (latitude: string, longitude: string) => void;
  defaultLatitude?: number;
  defaultLongitude?: number;
  defaultZoom?: number;
  countryCode?: string | null;
  /** Other POIs shown as context (non-editable). */
  contextPois?: ContextPoi[];
  title?: string;
  hint?: string;
  className?: string;
  ariaLabel?: string;
  /** When true, triggers Leaflet size recalculation (e.g. modal just opened). */
  active?: boolean;
};

const DEFAULT_CENTER = { latitude: 0, longitude: 20 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 12;

const BOUNDARY_STYLE = {
  color: '#0f766e',
  weight: 2,
  fillColor: '#14b8a6',
  fillOpacity: 0.14,
};

function formatCoord(value: number): string {
  return value.toFixed(5);
}

export function CoordinatePickerMap({
  latitude,
  longitude,
  onCoordinateChange,
  defaultLatitude = DEFAULT_CENTER.latitude,
  defaultLongitude = DEFAULT_CENTER.longitude,
  defaultZoom = DEFAULT_ZOOM,
  countryCode,
  contextPois = [],
  title,
  hint,
  className,
  ariaLabel,
  active = true,
}: CoordinatePickerMapProps) {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const boundaryLayerRef = useRef<import('leaflet').GeoJSON | null>(null);
  const contextLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const onChangeRef = useRef(onCoordinateChange);
  const initRef = useRef({
    latitude,
    longitude,
    defaultLatitude,
    defaultLongitude,
    defaultZoom,
  });
  const [mapReady, setMapReady] = useState(false);

  onChangeRef.current = onCoordinateChange;
  const code = (countryCode ?? '').trim().toUpperCase();
  const hasCountry = /^[A-Z]{2}$/.test(code);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    const {
      latitude: initialLatitude,
      longitude: initialLongitude,
      defaultLatitude: centerLat,
      defaultLongitude: centerLng,
      defaultZoom: zoom,
    } = initRef.current;

    let cancelled = false;

    void import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      const initialLat = parseDestinationCoord(initialLatitude) ?? centerLat;
      const initialLng = parseDestinationCoord(initialLongitude) ?? centerLng;
      const hasInitialCoords = hasValidDestinationCoords(initialLatitude, initialLongitude);

      const map = L.map(containerRef.current!, {
        scrollWheelZoom: true,
      }).setView([initialLat, initialLng], hasInitialCoords ? SELECTED_ZOOM : zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      contextLayerRef.current = L.layerGroup().addTo(map);

      const emitCoords = (lat: number, lng: number) => {
        onChangeRef.current(formatCoord(lat), formatCoord(lng));
      };

      const markerIcon = createLeafletMarkerIcon(L);

      const upsertMarker = (lat: number, lng: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          return;
        }

        const marker = L.marker([lat, lng], { draggable: true, icon: markerIcon });
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          emitCoords(position.lat, position.lng);
        });
        marker.addTo(map);
        markerRef.current = marker;
      };

      map.on('click', (event) => {
        const { lat, lng } = event.latlng;
        upsertMarker(lat, lng);
        emitCoords(lat, lng);
      });

      if (hasInitialCoords) {
        upsertMarker(initialLat, initialLng);
      }

      mapRef.current = map;
      setMapReady(true);

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    });

    return () => {
      cancelled = true;
      setMapReady(false);
      markerRef.current = null;
      boundaryLayerRef.current = null;
      contextLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    void import('leaflet').then((L) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      if (!hasValidDestinationCoords(latitude, longitude)) {
        markerRef.current?.remove();
        markerRef.current = null;
        return;
      }

      const lat = parseDestinationCoord(latitude)!;
      const lng = parseDestinationCoord(longitude)!;

      if (markerRef.current) {
        const current = markerRef.current.getLatLng();
        if (
          Math.abs(current.lat - lat) < 0.000001 &&
          Math.abs(current.lng - lng) < 0.000001
        ) {
          return;
        }
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: createLeafletMarkerIcon(L),
        });
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onChangeRef.current(formatCoord(position.lat), formatCoord(position.lng));
        });
        marker.addTo(map);
        markerRef.current = marker;
      }

      map.panTo([lat, lng], { animate: true });
    });
  }, [latitude, longitude, mapReady]);

  useEffect(() => {
    if (!mapReady || !contextLayerRef.current) {
      return;
    }

    void import('leaflet').then((L) => {
      const layer = contextLayerRef.current;
      if (!layer) return;
      layer.clearLayers();
      const icon = createLeafletPoiMarkerIcon(L);
      for (const poi of contextPois) {
        if (!hasValidDestinationCoords(poi.latitude, poi.longitude)) continue;
        const lat = parseDestinationCoord(poi.latitude)!;
        const lng = parseDestinationCoord(poi.longitude)!;
        const marker = L.marker([lat, lng], { icon, interactive: true });
        marker.bindTooltip(poi.name, { direction: 'top', offset: [0, -8], opacity: 0.9 });
        marker.addTo(layer);
      }
    });
  }, [contextPois, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    boundaryLayerRef.current?.remove();
    boundaryLayerRef.current = null;

    if (!hasCountry) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const L = await import('leaflet');
        const geojson = await fetchCountryBoundaryGeoJson(code, {
          signal: controller.signal,
          countryName: getIsoCountryLabel(code, locale),
        });
        if (controller.signal.aborted || mapRef.current !== map || !geojson) {
          return;
        }
        const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
          style: () => BOUNDARY_STYLE,
        });
        layer.addTo(map);
        boundaryLayerRef.current = layer;

        if (!hasValidDestinationCoords(latitude, longitude)) {
          const bounds = layer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [24, 24], maxZoom: 8, animate: true });
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Country boundary load failed', error);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [code, hasCountry, mapReady, locale]);

  useEffect(() => {
    if (!active || !mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [active, mapReady]);

  return (
    <section className={cn('space-y-2', className)} aria-label={ariaLabel ?? title}>
      {title ? <h3 className="text-sm font-semibold text-atg-fg">{title}</h3> : null}
      {hint ? <p className="text-xs text-atg-muted">{hint}</p> : null}
      <div className="overflow-hidden rounded-xl border border-atg-border bg-atg-surface">
        <div
          ref={containerRef}
          className="h-56 w-full sm:h-72"
          role="application"
          aria-label={ariaLabel ?? title}
        />
      </div>
    </section>
  );
}
