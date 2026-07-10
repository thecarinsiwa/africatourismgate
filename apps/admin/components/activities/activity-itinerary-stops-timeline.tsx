'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import type { ActivityItineraryStop } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { formatDurationMinutes } from '../../lib/flight-datetime';

type ActivityItineraryStopsTimelineProps = {
  stops: ActivityItineraryStop[];
  className?: string;
};

function StopBlock({
  stop,
  orderLabel,
}: {
  stop: ActivityItineraryStop;
  orderLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <DataTableBadge variant="muted">
          {orderLabel} {stop.stopOrder}
        </DataTableBadge>
      </div>
      <span className="truncate text-sm font-medium text-atg-fg">{stop.name}</span>
      {stop.description ? (
        <p className="line-clamp-2 text-xs text-atg-muted">{stop.description}</p>
      ) : null}
      {stop.durationMinutes != null && stop.durationMinutes > 0 ? (
        <p className="text-xs text-atg-muted">
          {formatDurationMinutes(stop.durationMinutes)}
        </p>
      ) : null}
      <p className="font-mono text-xs tabular-nums text-atg-muted">
        {Number(stop.latitude).toFixed(5)}, {Number(stop.longitude).toFixed(5)}
      </p>
    </div>
  );
}

function StopConnector({ vertical }: { vertical?: boolean }) {
  if (vertical) {
    return <div className="ml-4 h-6 w-px bg-atg-border md:hidden" aria-hidden />;
  }

  return (
    <div
      className="hidden flex-col items-center gap-0.5 py-2 md:flex md:flex-1 md:flex-row md:px-2 md:py-0"
      aria-hidden
    >
      <div className="hidden h-px flex-1 bg-atg-border md:block" />
      <svg
        className="h-4 w-4 text-atg-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="hidden h-px flex-1 bg-atg-border md:block" />
    </div>
  );
}

export function ActivityItineraryStopsTimeline({
  stops,
  className,
}: ActivityItineraryStopsTimelineProps) {
  const t = useTranslations('modules.activities.sections.itineraryStops');
  const sorted = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-atg-border bg-atg-surface/50 p-4 sm:p-6',
        className,
      )}
      role="group"
      aria-label={t('timelineAria')}
    >
      <div className="flex flex-col md:hidden">
        {sorted.map((stop, index) => (
          <div key={stop.id}>
            <StopBlock stop={stop} orderLabel={t('order')} />
            {index < sorted.length - 1 ? <StopConnector vertical /> : null}
          </div>
        ))}
      </div>

      <div className="hidden md:flex md:items-start md:justify-between">
        {sorted.map((stop, index) => (
          <div key={stop.id} className="flex min-w-0 flex-1 items-center">
            <StopBlock stop={stop} orderLabel={t('order')} />
            {index < sorted.length - 1 ? <StopConnector /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
