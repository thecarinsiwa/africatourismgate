'use client';

import { cn } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
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

export type DestinationMapPoi = {
  id: string;
  name: string;
  latitude: string | number | null | undefined;
  longitude: string | number | null | undefined;
};

type DestinationStaticMapProps = {
  countryCode?: string | null;
  latitude: string | number | null | undefined;
  longitude: string | number | null | undefined;
  destinationName?: string;
  pointsOfInterest?: DestinationMapPoi[];
  /** Open popup / pan to this POI when set. */
  highlightedPoiId?: string | null;
  onPoiSelect?: (poiId: string) => void;
  title?: string;
  openMapsLabel?: string;
  className?: string;
  /** Smaller map for side panels / sticky asides. */
  compact?: boolean;
  /** Hide the OpenStreetMap external link. */
  hideExternalLink?: boolean;
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

function toLatLng(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined,
): [number, number] | null {
  if (!hasValidDestinationCoords(latitude, longitude)) {
    return null;
  }
  return [parseDestinationCoord(latitude)!, parseDestinationCoord(longitude)!];
}

function fitMapContent(
  map: import('leaflet').Map,
  L: typeof import('leaflet'),
  options: {
    boundaryLayer: import('leaflet').GeoJSON | null;
    points: [number, number][];
  },
) {
  const { boundaryLayer, points } = options;
  let bounds: import('leaflet').LatLngBounds | null = null;

  if (boundaryLayer) {
    const layerBounds = boundaryLayer.getBounds();
    if (layerBounds.isValid()) {
      bounds = layerBounds;
    }
  }

  for (const point of points) {
    if (!bounds) {
      bounds = L.latLngBounds([point]);
    } else {
      bounds.extend(point);
    }
  }

  if (bounds?.isValid()) {
    map.fitBounds(bounds, {
      padding: [28, 28],
      maxZoom: points.length > 1 || boundaryLayer ? 11 : 8,
      animate: true,
    });
    return;
  }

  if (points.length === 1) {
    map.setView(points[0], POINT_ZOOM);
  }
}

export function DestinationStaticMap({
  countryCode,
  latitude,
  longitude,
  destinationName,
  pointsOfInterest = [],
  highlightedPoiId = null,
  onPoiSelect,
  title,
  openMapsLabel,
  className,
  compact = false,
  hideExternalLink = false,
}: DestinationStaticMapProps) {
  const t = useTranslations('modules.destinations');
  const tForm = useTranslations('modules.destinations.form');
  const tView = useTranslations('modules.destinations.view');
  const locale = useLocale();
  const mapTitle = title ?? t('form.mapPreview');
  const mapsLinkLabel = openMapsLabel ?? t('form.openStreetMap');

  const hasCoords = hasValidDestinationCoords(latitude, longitude);
  const code = (countryCode ?? '').trim().toUpperCase();
  const hasCountry = /^[A-Z]{2}$/.test(code);

  const mappedPois = useMemo(() => {
    return pointsOfInterest.flatMap((poi) => {
      const point = toLatLng(poi.latitude, poi.longitude);
      if (!point) return [];
      return [{ id: poi.id, name: poi.name, point }];
    });
  }, [pointsOfInterest]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const centerMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const poiLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const poiMarkersRef = useRef<Map<string, import('leaflet').Marker>>(new Map());
  const boundaryLayerRef = useRef<import('leaflet').GeoJSON | null>(null);
  const onPoiSelectRef = useRef(onPoiSelect);
  const [mapReady, setMapReady] = useState(false);
  const [boundaryStatus, setBoundaryStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error' | 'empty'
  >('idle');

  onPoiSelectRef.current = onPoiSelect;

  const lat = hasCoords ? parseDestinationCoord(latitude)! : null;
  const lng = hasCoords ? parseDestinationCoord(longitude)! : null;
  const contentPoints = useMemo(() => {
    const points: [number, number][] = [];
    if (lat != null && lng != null) {
      points.push([lat, lng]);
    }
    for (const poi of mappedPois) {
      points.push(poi.point);
    }
    return points;
  }, [lat, lng, mappedPois]);

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

      poiLayerRef.current = L.layerGroup().addTo(map);

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
      centerMarkerRef.current = null;
      poiLayerRef.current = null;
      poiMarkersRef.current.clear();
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

      if (lat == null || lng == null) {
        centerMarkerRef.current?.remove();
        centerMarkerRef.current = null;
        return;
      }

      const popupLabel = destinationName?.trim() || tView('mapCenterLabel');

      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng([lat, lng]);
        centerMarkerRef.current.bindPopup(popupLabel);
      } else {
        const marker = L.marker([lat, lng], {
          icon: createLeafletMarkerIcon(L),
        });
        marker.bindPopup(popupLabel);
        marker.addTo(map);
        centerMarkerRef.current = marker;
      }
    });
  }, [lat, lng, mapReady, destinationName, tView]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !poiLayerRef.current) {
      return;
    }

    void import('leaflet').then((L) => {
      const layer = poiLayerRef.current;
      if (!layer) {
        return;
      }

      layer.clearLayers();
      poiMarkersRef.current.clear();
      const icon = createLeafletPoiMarkerIcon(L);
      for (const poi of mappedPois) {
        const marker = L.marker(poi.point, { icon });
        marker.bindPopup(poi.name);
        marker.bindTooltip(poi.name, {
          direction: 'top',
          offset: [0, -8],
          opacity: 0.9,
        });
        marker.on('click', () => {
          onPoiSelectRef.current?.(poi.id);
        });
        marker.addTo(layer);
        poiMarkersRef.current.set(poi.id, marker);
      }
    });
  }, [mappedPois, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !highlightedPoiId) {
      return;
    }
    const marker = poiMarkersRef.current.get(highlightedPoiId);
    if (!marker) {
      return;
    }
    const map = mapRef.current;
    map.panTo(marker.getLatLng(), { animate: true });
    marker.openPopup();
  }, [highlightedPoiId, mapReady, mappedPois]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    boundaryLayerRef.current?.remove();
    boundaryLayerRef.current = null;

    if (!hasCountry) {
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
  }, [code, hasCountry, mapReady, locale]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }
    if (hasCountry && boundaryStatus === 'loading') {
      return;
    }

    const map = mapRef.current;
    void import('leaflet').then((L) => {
      if (mapRef.current !== map) return;
      fitMapContent(map, L, {
        boundaryLayer: boundaryLayerRef.current,
        points: contentPoints,
      });
    });
  }, [mapReady, hasCountry, boundaryStatus, contentPoints]);

  if (!hasCoords && !hasCountry && mappedPois.length === 0) {
    return null;
  }

  const externalUrl =
    lat != null && lng != null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`
      : hasCountry
        ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(code)}`
        : null;

  const mapHeightClass =
    mappedPois.length > 0
      ? compact
        ? 'h-52 w-full sm:h-64'
        : 'h-64 w-full sm:h-80'
      : compact
        ? 'h-40 w-full'
        : 'h-56 w-full sm:h-64';

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
      {mappedPois.length > 0 ? (
        <p className="text-xs text-atg-muted">
          {tView('mapPoiHint', { count: mappedPois.length })}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-atg-border bg-atg-surface">
        <div
          ref={containerRef}
          className={mapHeightClass}
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
      {!hideExternalLink && externalUrl ? (
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
