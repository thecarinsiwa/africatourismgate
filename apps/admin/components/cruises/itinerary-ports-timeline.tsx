'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import type { CruisePort, ItineraryPort } from '@africatourismgate/types';

export type ItineraryPortStop = ItineraryPort & {
  port: CruisePort | null;
};

type ItineraryPortsTimelineProps = {
  stops: ItineraryPortStop[];
  className?: string;
};

function formatTime(t: string | null): string {
  if (!t) return '—';
  return t.slice(0, 5);
}

function PortBlock({ stop }: { stop: ItineraryPortStop }) {
  const port = stop.port;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <DataTableBadge variant="muted">Jour {stop.dayNumber}</DataTableBadge>
        {port ? (
          <DataTableBadge variant="default">{port.code}</DataTableBadge>
        ) : null}
      </div>
      <span className="truncate text-sm font-medium text-atg-fg">
        {port?.name ?? 'Port inconnu'}
      </span>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-atg-muted">
        <span>Arr. {formatTime(stop.arrivalTime)}</span>
        <span>Dép. {formatTime(stop.departureTime)}</span>
      </div>
    </div>
  );
}

function StopConnector({ vertical }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="ml-4 h-6 w-px bg-atg-border md:hidden" aria-hidden />
    );
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

export function ItineraryPortsTimeline({ stops, className }: ItineraryPortsTimelineProps) {
  const sorted = [...stops].sort((a, b) => a.dayNumber - b.dayNumber);

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
      aria-label="Schéma des escales"
    >
      {/* Vertical timeline — mobile */}
      <div className="flex flex-col md:hidden">
        {sorted.map((stop, index) => (
          <div key={stop.id}>
            <PortBlock stop={stop} />
            {index < sorted.length - 1 ? <StopConnector vertical /> : null}
          </div>
        ))}
      </div>

      {/* Horizontal timeline — desktop */}
      <div className="hidden md:flex md:items-start md:justify-between">
        {sorted.map((stop, index) => (
          <div key={stop.id} className="flex min-w-0 flex-1 items-center">
            <PortBlock stop={stop} />
            {index < sorted.length - 1 ? <StopConnector /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
