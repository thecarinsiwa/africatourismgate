'use client';

import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import {
  buildDestinationMapEmbedUrl,
  hasValidDestinationCoords,
  parseDestinationCoord,
} from '../../lib/destination-coords';

type DestinationStaticMapProps = {
  latitude: string | number | null | undefined;
  longitude: string | number | null | undefined;
  title?: string;
  openMapsLabel?: string;
  className?: string;
  /** Smaller map for side panels / sticky asides. */
  compact?: boolean;
};

export function DestinationStaticMap({
  latitude,
  longitude,
  title,
  openMapsLabel,
  className,
  compact = false,
}: DestinationStaticMapProps) {
  const t = useTranslations('modules.destinations');
  const mapTitle = title ?? t('form.mapPreview');
  const mapsLinkLabel = openMapsLabel ?? t('form.openStreetMap');

  if (!hasValidDestinationCoords(latitude, longitude)) {
    return null;
  }

  const lat = parseDestinationCoord(latitude)!;
  const lng = parseDestinationCoord(longitude)!;
  const embedUrl = buildDestinationMapEmbedUrl(lat, lng);
  const externalUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`;

  return (
    <section className={cn('space-y-3', className)} aria-label={mapTitle}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-atg-fg">{mapTitle}</h3>
        <p className="font-mono text-xs tabular-nums text-atg-muted">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-atg-border bg-atg-surface">
        <iframe
          title={mapTitle}
          src={embedUrl}
          className={compact ? 'h-40 w-full border-0' : 'h-56 w-full border-0 sm:h-64'}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
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
    </section>
  );
}
