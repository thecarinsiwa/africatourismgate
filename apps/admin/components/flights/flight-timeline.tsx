'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import {
  formatDurationMinutes,
  formatFlightSchedule,
} from '../../lib/flight-datetime';

export type FlightTimelineAirport = {
  iataCode: string;
  city: string;
  name?: string;
};

type FlightTimelineVariant = 'default' | 'compact' | 'card';

type FlightTimelineProps = {
  departureAirport: FlightTimelineAirport | null;
  arrivalAirport: FlightTimelineAirport | null;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  compact?: boolean;
  variant?: FlightTimelineVariant;
  className?: string;
};

function AirportBlock({
  airport,
  time,
  align,
  compact,
  emptyDash,
}: {
  airport: FlightTimelineAirport | null;
  time: string;
  align: 'start' | 'end';
  compact?: boolean;
  emptyDash: string;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1',
        align === 'end' && 'items-start md:items-end md:text-right',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-2',
          align === 'end' && 'md:flex-row-reverse',
        )}
      >
        <DataTableBadge variant="default">
          {airport?.iataCode ?? '?'}
        </DataTableBadge>
        {!compact ? (
          <span className="truncate text-sm font-medium text-atg-fg">
            {airport?.city ?? emptyDash}
          </span>
        ) : null}
      </div>
      {!compact && airport?.name ? (
        <span className="truncate text-xs text-atg-muted">{airport.name}</span>
      ) : null}
      <span className="text-sm tabular-nums text-atg-muted">{time}</span>
    </div>
  );
}

function DurationConnector({
  durationMinutes,
  compact,
  durationAriaLabel,
}: {
  durationMinutes: number;
  compact?: boolean;
  durationAriaLabel: string;
}) {
  const label = formatDurationMinutes(durationMinutes);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-atg-muted" aria-hidden>
        <span className="hidden h-px flex-1 bg-atg-border sm:block" />
        <span className="shrink-0 tabular-nums">{label}</span>
        <span className="hidden h-px flex-1 bg-atg-border sm:block" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-1 py-2 md:flex-1 md:flex-row md:px-4 md:py-0"
      aria-label={durationAriaLabel}
    >
      <div className="hidden h-px flex-1 bg-atg-border md:block" />
      <div className="flex flex-col items-center gap-0.5">
        <svg
          className="h-4 w-4 rotate-90 text-atg-muted md:rotate-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs font-medium tabular-nums text-atg-muted">{label}</span>
      </div>
      <div className="h-8 w-px bg-atg-border md:hidden" />
      <div className="hidden h-px flex-1 bg-atg-border md:block" />
    </div>
  );
}

function CardAirportBlock({
  airport,
  time,
  align,
  emptyDash,
}: {
  airport: FlightTimelineAirport | null;
  time: string;
  align: 'start' | 'end';
  emptyDash: string;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1',
        align === 'end' && 'items-end text-right',
      )}
    >
      <DataTableBadge variant="default">{airport?.iataCode ?? '?'}</DataTableBadge>
      <span className="line-clamp-1 text-sm font-medium text-atg-fg">
        {airport?.city ?? emptyDash}
      </span>
      <div className="min-h-[2.5rem]">
        {airport?.name ? (
          <span className="line-clamp-2 text-xs leading-snug text-atg-muted">{airport.name}</span>
        ) : null}
      </div>
      <span className="text-xs leading-snug tabular-nums text-atg-muted">{time}</span>
    </div>
  );
}

function CardDurationConnector({
  durationMinutes,
  durationAriaLabel,
}: {
  durationMinutes: number;
  durationAriaLabel: string;
}) {
  const label = formatDurationMinutes(durationMinutes);

  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 self-center px-1 pt-5"
      aria-label={durationAriaLabel}
    >
      <svg
        className="h-4 w-4 shrink-0 text-atg-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="whitespace-nowrap text-xs font-medium tabular-nums text-atg-muted">
        {label}
      </span>
    </div>
  );
}

export function FlightTimeline({
  departureAirport,
  arrivalAirport,
  departureTime,
  arrivalTime,
  durationMinutes,
  compact = false,
  variant,
  className,
}: FlightTimelineProps) {
  const tDetail = useTranslations('modules.flights.detail');
  const tCommon = useTranslations('modules.common');
  const schedule = formatFlightSchedule(departureTime, arrivalTime);
  const durationLabel = formatDurationMinutes(durationMinutes);
  const resolvedVariant: FlightTimelineVariant =
    variant ?? (compact ? 'compact' : 'default');

  if (resolvedVariant === 'card') {
    return (
      <div
        className={cn(
          'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2',
          className,
        )}
        role="group"
        aria-label={tDetail('timelineAria')}
      >
        <CardAirportBlock
          airport={departureAirport}
          time={schedule.departure}
          align="start"
          emptyDash={tCommon('empty.dash')}
        />
        <CardDurationConnector
          durationMinutes={durationMinutes}
          durationAriaLabel={tDetail('durationAria', { label: durationLabel })}
        />
        <CardAirportBlock
          airport={arrivalAirport}
          time={schedule.arrival}
          align="end"
          emptyDash={tCommon('empty.dash')}
        />
      </div>
    );
  }

  const isCompact = resolvedVariant === 'compact';

  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        isCompact && 'gap-2 md:gap-3',
        className,
      )}
      role="group"
      aria-label={tDetail('timelineAria')}
    >
      <AirportBlock
        airport={departureAirport}
        time={schedule.departure}
        align="start"
        compact={isCompact}
        emptyDash={tCommon('empty.dash')}
      />
      <DurationConnector
        durationMinutes={durationMinutes}
        compact={isCompact}
        durationAriaLabel={tDetail('durationAria', { label: durationLabel })}
      />
      <AirportBlock
        airport={arrivalAirport}
        time={schedule.arrival}
        align="end"
        compact={isCompact}
        emptyDash={tCommon('empty.dash')}
      />
    </div>
  );
}
