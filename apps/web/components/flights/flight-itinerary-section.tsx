'use client';

import type { FlightDetail, FlightDetailAirport, FlightLayover } from '../../lib/flights/types';
import { formatDuration, formatFlightTime } from '../../lib/flights/listings';
import type { Translations } from '../../lib/i18n/translations';

type FlightItinerarySectionProps = {
  detail: FlightDetail;
  t: Translations['flights'];
  locale?: string;
};

function IataBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex min-h-[36px] min-w-[3.25rem] items-center justify-center rounded-lg bg-primary/10 px-2.5 text-base font-bold tracking-wide text-primary dark:bg-primary/20">
      {code}
    </span>
  );
}

function AirportBlock({
  airport,
  time,
  label,
  align = 'start',
  locale,
}: {
  airport: FlightDetailAirport;
  time: string;
  label: string;
  align?: 'start' | 'end';
  locale?: string;
}) {
  const alignClass = align === 'end' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-2 ${alignClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">{label}</p>
      <IataBadge code={airport.iataCode} />
      <div>
        <p className="text-sm font-medium text-atg-fg">{airport.city}</p>
        <p className="mt-0.5 text-xs text-atg-muted">{airport.name}</p>
      </div>
      <p className="text-lg font-semibold tabular-nums text-atg-fg">
        {formatFlightTime(time, locale)}
      </p>
    </div>
  );
}

function LayoverChip({
  layover,
  t,
}: {
  layover: FlightLayover;
  t: Translations['flights'];
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-atg-border bg-atg-surface px-3 py-2 text-center dark:border-atg-border dark:bg-atg-surface">
      <IataBadge code={layover.airport.iataCode} />
      <p className="text-xs font-medium text-atg-fg">{layover.airport.city}</p>
      <p className="text-xs text-atg-muted">
        {t.layoverDuration.replace('{duration}', formatDuration(layover.durationMinutes))}
      </p>
    </div>
  );
}

function TimelineConnector({ vertical }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center py-1" aria-hidden>
        <span className="h-3 w-px bg-atg-border dark:bg-atg-border" />
        <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="h-3 w-px bg-atg-border dark:bg-atg-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center gap-1 px-2" aria-hidden>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
      <svg className="h-4 w-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
    </div>
  );
}

function DurationBadge({
  minutes,
  stopsLabel,
}: {
  minutes: number;
  stopsLabel: string;
}) {
  return (
    <div className="inline-flex flex-col items-center rounded-xl border border-atg-border bg-atg-surface px-4 py-2 text-center dark:border-atg-border dark:bg-atg-surface">
      <p className="text-sm font-semibold text-atg-fg">{formatDuration(minutes)}</p>
      <p className="mt-0.5 text-xs text-atg-muted">{stopsLabel}</p>
    </div>
  );
}

export function FlightItinerarySection({ detail, t, locale }: FlightItinerarySectionProps) {
  const layovers = detail.layovers ?? [];
  const stopsLabel =
    layovers.length === 0
      ? t.direct
      : layovers.length === 1
        ? t.layoverSingular
        : t.layoverPlural.replace('{n}', String(layovers.length));

  return (
    <section
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-label={t.itineraryTitle}
    >
      <h2 className="text-lg font-bold text-atg-fg">{t.itineraryTitle}</h2>

      {/* Mobile — stack vertical */}
      <div className="mt-6 flex flex-col gap-3 md:hidden">
        <AirportBlock
          airport={detail.departureAirport}
          time={detail.departureTime}
          label={t.departure}
          locale={locale}
        />

        <div className="flex items-center gap-3 pl-4">
          <TimelineConnector vertical />
          <DurationBadge minutes={detail.durationMinutes} stopsLabel={stopsLabel} />
        </div>

        {layovers.map((layover) => (
          <div key={layover.airport.iataCode} className="flex items-center gap-3 pl-4">
            <TimelineConnector vertical />
            <LayoverChip layover={layover} t={t} />
          </div>
        ))}

        <div className="flex items-center gap-3 pl-4">
          <TimelineConnector vertical />
        </div>

        <AirportBlock
          airport={detail.arrivalAirport}
          time={detail.arrivalTime}
          label={t.arrival}
          locale={locale}
        />
      </div>

      {/* Desktop — timeline horizontale */}
      <div className="mt-6 hidden md:block">
        <div className="flex items-start justify-between gap-4">
          <AirportBlock
            airport={detail.departureAirport}
            time={detail.departureTime}
            label={t.departure}
            locale={locale}
          />

          <div className="flex min-w-0 flex-1 flex-col items-center pt-8">
            <DurationBadge minutes={detail.durationMinutes} stopsLabel={stopsLabel} />
            <div className="mt-3 flex w-full max-w-md items-center">
              <TimelineConnector />
            </div>
            {layovers.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {layovers.map((layover) => (
                  <LayoverChip key={layover.airport.iataCode} layover={layover} t={t} />
                ))}
              </div>
            ) : null}
          </div>

          <AirportBlock
            airport={detail.arrivalAirport}
            time={detail.arrivalTime}
            label={t.arrival}
            align="end"
            locale={locale}
          />
        </div>
      </div>
    </section>
  );
}
