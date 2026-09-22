'use client';

import { cn } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { fetchCountryBoundaryGeoJson } from '../../lib/country-boundary-geojson';
import {
  hasValidDestinationCoords,
  parseDestinationCoord,
} from '../../lib/destination-coords';
import { getIsoCountryLabel } from '../../lib/iso-countries';
import { createLeafletMarkerIcon } from '../../lib/leaflet-marker-icon';

type DestinationGeographyMapProps = {
  countryCode: string;
  latitude: string;
  longitude: string;
  onCoordinateChange: (latitude: string, longitude: string) => void;
  className?: string;
};

const DEFAULT_CENTER: [number, number] = [0, 20];
const DEFAULT_ZOOM = 3;
const POINT_ZOOM = 12;

const BOUNDARY_STYLE = {
  color: '#0f766e',
  weight: 2,
  fillColor: '#14b8a6',
  fillOpacity: 0.18,
};

function formatCoord(value: number): string {
  return value.toFixed(5);
}

export function DestinationGeographyMap({
  countryCode,
  latitude,
  longitude,
  onCoordinateChange,
  className,
}: DestinationGeographyMapProps) {
  const t = useTranslations('modules.destinations.form');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const boundaryLayerRef = useRef<import('leaflet').GeoJSON | null>(null);
  const onChangeRef = useRef(onCoordinateChange);
  const [mapReady, setMapReady] = useState(false);
  const [boundaryStatus, setBoundaryStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error' | 'empty'
  >('idle');

  onChangeRef.current = onCoordinateChange;

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

      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const markerIcon = createLeafletMarkerIcon(L);

      const emitCoords = (lat: number, lng: number) => {
        onChangeRef.current(formatCoord(lat), formatCoord(lng));
      };

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

      if (hasValidDestinationCoords(latitude, longitude)) {
        const lat = parseDestinationCoord(latitude)!;
        const lng = parseDestinationCoord(longitude)!;
        upsertMarker(lat, lng);
        map.setView([lat, lng], POINT_ZOOM);
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
      boundaryLayerRef.current = null;
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Init once — coords/country handled in dedicated effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    });
  }, [latitude, longitude, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const code = countryCode.trim().toUpperCase();

    boundaryLayerRef.current?.remove();
    boundaryLayerRef.current = null;

    if (!/^[A-Z]{2}$/.test(code)) {
      setBoundaryStatus('idle');
      return;
    }

    const controller = new AbortController();
    setBoundaryStatus('loading');

    void (async () => {
      try {
        const L = await import('leaflet');
        const geojson = await fetchCountryBoundaryGeoJson(code, {
          signal: controller.signal,
          countryName: getIsoCountryLabel(code, locale),
        });

        if (controller.signal.aborted || mapRef.current !== map) {
          return;
        }

        if (!geojson) {
          setBoundaryStatus('empty');
          return;
        }

        const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
          style: () => BOUNDARY_STYLE,
        });
        layer.addTo(map);
        boundaryLayerRef.current = layer;

        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          // Cadre uniquement le pays — le marqueur peut rester hors zone
          // jusqu'à ce que l'utilisateur reclique (ex. changement de pays).
          map.fitBounds(bounds, {
            padding: [28, 28],
            maxZoom: 8,
            animate: true,
          });
        }

        setBoundaryStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setBoundaryStatus('error');
        console.warn('Country boundary load failed', error);
      }
    })();

    return () => {
      controller.abort();
    };
    // Fit on country change only (not on every lat/lng edit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, mapReady, locale]);

  const coordsLabel = hasValidDestinationCoords(latitude, longitude)
    ? `${parseDestinationCoord(latitude)!.toFixed(5)}, ${parseDestinationCoord(longitude)!.toFixed(5)}`
    : null;

  return (
    <section className={cn('space-y-2', className)} aria-label={t('mapPreview')}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
          {t('mapPreview')}
        </h4>
        {coordsLabel ? (
          <p className="font-mono text-xs tabular-nums text-atg-muted">{coordsLabel}</p>
        ) : null}
      </div>
      <p className="text-xs text-atg-muted">{t('mapBoundaryHint')}</p>
      <div className="overflow-hidden rounded-xl border border-atg-border bg-atg-surface">
        <div
          ref={containerRef}
          className="h-56 w-full sm:h-72"
          role="application"
          aria-label={t('mapBoundaryAria')}
        />
      </div>
      {boundaryStatus === 'loading' ? (
        <p className="text-xs text-atg-muted" role="status">
          {t('mapBoundaryLoading')}
        </p>
      ) : null}
      {boundaryStatus === 'error' || boundaryStatus === 'empty' ? (
        <p className="text-xs text-atg-muted" role="status">
          {t('mapBoundaryUnavailable')}
        </p>
      ) : null}
    </section>
  );
}
