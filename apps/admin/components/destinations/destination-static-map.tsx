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

type DestinationStaticMapProps = {
  countryCode?: string | null;
  latitude: string | number | null | undefined;
  longitude: string | number | null | undefined;
  title?: string;
  openMapsLabel?: string;
  className?: string;
  /** Smaller map for side panels / sticky asides. */
  compact?: boolean;
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

export function DestinationStaticMap({
  countryCode,
  latitude,
  longitude,
  title,
  openMapsLabel,
  className,
  compact = false,
}: DestinationStaticMapProps) {
  const t = useTranslations('modules.destinations');
  const tForm = useTranslations('modules.destinations.form');
  const locale = useLocale();
  const mapTitle = title ?? t('form.mapPreview');
  const mapsLinkLabel = openMapsLabel ?? t('form.openStreetMap');

  const hasCoords = hasValidDestinationCoords(latitude, longitude);
  const code = (countryCode ?? '').trim().toUpperCase();
  const hasCountry = /^[A-Z]{2}$/.test(code);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const boundaryLayerRef = useRef<import('leaflet').GeoJSON | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [boundaryStatus, setBoundaryStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error' | 'empty'
  >('idle');

  const lat = hasCoords ? parseDestinationCoord(latitude)! : null;
  const lng = hasCoords ? parseDestinationCoord(longitude)! : null;

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

      if (lat != null && lng != null) {
        const marker = L.marker([lat, lng], {
          interactive: false,
          icon: createLeafletMarkerIcon(L),
        });
        marker.addTo(map);
        markerRef.current = marker;
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
    // Init once — country/coords handled in dedicated effects.
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

      if (lat == null || lng == null) {
        markerRef.current?.remove();
        markerRef.current = null;
        return;
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          interactive: false,
          icon: createLeafletMarkerIcon(L),
        });
        marker.addTo(map);
        markerRef.current = marker;
      }
    });
  }, [lat, lng, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    boundaryLayerRef.current?.remove();
    boundaryLayerRef.current = null;

    if (!hasCountry) {
      setBoundaryStatus('idle');
      if (lat != null && lng != null) {
        map.setView([lat, lng], POINT_ZOOM);
      }
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
          if (lat != null && lng != null) {
            map.setView([lat, lng], POINT_ZOOM);
          }
          return;
        }

        const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
          style: () => BOUNDARY_STYLE,
        });
        layer.addTo(map);
        boundaryLayerRef.current = layer;

        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          if (lat != null && lng != null) {
            map.fitBounds(bounds.extend([lat, lng]), {
              padding: [28, 28],
              maxZoom: 10,
              animate: true,
            });
          } else {
            map.fitBounds(bounds, {
              padding: [28, 28],
              maxZoom: 8,
              animate: true,
            });
          }
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
    // Fit when country is ready; lat/lng read at fetch time for padding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, hasCountry, mapReady, locale]);

  if (!hasCoords && !hasCountry) {
    return null;
  }

  const externalUrl =
    lat != null && lng != null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`
      : hasCountry
        ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(code)}`
        : null;

  return (
    <section className={cn('space-y-3', className)} aria-label={mapTitle}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-atg-fg">{mapTitle}</h3>
        {lat != null && lng != null ? (
          <p className="font-mono text-xs tabular-nums text-atg-muted">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-atg-border bg-atg-surface">
        <div
          ref={containerRef}
          className={compact ? 'h-40 w-full' : 'h-56 w-full sm:h-64'}
          role="img"
          aria-label={tForm('mapBoundaryAria')}
        />
      </div>
      {boundaryStatus === 'loading' ? (
        <p className="text-xs text-atg-muted" role="status">
          {tForm('mapBoundaryLoading')}
        </p>
      ) : null}
      {boundaryStatus === 'error' || boundaryStatus === 'empty' ? (
        <p className="text-xs text-atg-muted" role="status">
          {tForm('mapBoundaryUnavailable')}
        </p>
      ) : null}
      {externalUrl ? (
        <p className="text-xs text-atg-muted">
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:text-primary-hover"
          >
            {mapsLinkLabel}
          </a>
        </p>
      ) : null}
    </section>
  );
}
