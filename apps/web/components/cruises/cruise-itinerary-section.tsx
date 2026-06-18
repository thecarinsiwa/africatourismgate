'use client';

import { Fragment } from 'react';
import { formatPortTime } from '../../lib/cruises/listings';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseItineraryPort, CruiseSailingDetail } from '../../lib/cruises/types';
import { addDays, formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type CruiseItinerarySectionProps = {
  detail: CruiseSailingDetail;
  t: Translations['cruises'];
  locale?: string;
};

function PortCodeBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex min-h-[36px] items-center justify-center rounded-lg bg-primary/10 px-2.5 text-sm font-bold tracking-wide text-primary dark:bg-primary/20">
      {code}
    </span>
  );
}

function TimelineConnector({ vertical }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center py-1" aria-hidden>
        <span className="h-3 w-px bg-atg-border dark:bg-atg-border" />
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="h-3 w-px bg-atg-border dark:bg-atg-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center px-2" aria-hidden>
      <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
      <span className="mx-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
    </div>
  );
}

function PortStopContent({
  stop,
  portDate,
  t,
  locale,
}: {
  stop: CruiseItineraryPort;
  portDate: string;
  t: Translations['cruises'];
  locale?: string;
}) {
  const portLabel = formatCruisePortLabel(stop.portCode, stop.portName);

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {t.dayLabel.replace('{n}', String(stop.dayNumber))}
      </p>
      <p className="mt-1 text-sm font-medium text-atg-fg">{formatDisplayDate(portDate, locale)}</p>
      <div className="mt-2">
        <PortCodeBadge code={stop.portCode} />
      </div>
      <p className="mt-2 text-base font-bold text-atg-fg">{portLabel}</p>
      <p className="text-xs text-atg-muted">{stop.countryCode}</p>
      <div className="mt-2 space-y-0.5 text-sm text-atg-muted">
        {stop.arrivalTime ? (
          <p>
            {t.portArrival}: {formatPortTime(stop.arrivalTime, locale)}
          </p>
        ) : null}
        {stop.departureTime ? (
          <p>
            {t.portDeparture}: {formatPortTime(stop.departureTime, locale)}
          </p>
        ) : null}
      </div>
    </>
  );
}

export function CruiseItinerarySection({ detail, t, locale }: CruiseItinerarySectionProps) {
  if (!detail.itineraryPorts.length) return null;

  const sortedPorts = [...detail.itineraryPorts].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <section
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-labelledby="cruise-itinerary-heading"
    >
      <h2 id="cruise-itinerary-heading" className="text-lg font-bold text-atg-fg">
        {t.itineraryTitle}
      </h2>
      <p className="mt-1 text-sm text-atg-muted">
        {formatCruisePortLabel(detail.sailFromPortCode, detail.sailFromPortName)} →{' '}
        {formatCruisePortLabel(detail.sailToPortCode, detail.sailToPortName)} ·{' '}
        {formatDisplayDate(detail.departureDate, locale)} →{' '}
        {formatDisplayDate(detail.returnDate, locale)}
      </p>

      <ol className="mt-6 flex flex-col md:flex-row md:items-start">
        {sortedPorts.map((stop, index) => {
          const portDate = addDays(detail.departureDate, stop.dayNumber - 1);

          return (
            <Fragment key={`${stop.dayNumber}-${stop.portCode}`}>
              {index > 0 ? (
                <li
                  className="flex list-none justify-center py-1 md:hidden md:py-0"
                  aria-hidden
                >
                  <TimelineConnector vertical />
                </li>
              ) : null}

              <li className="min-w-0 flex-1 rounded-xl border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-atg-surface">
                <PortStopContent stop={stop} portDate={portDate} t={t} locale={locale} />
              </li>

              {index < sortedPorts.length - 1 ? (
                <li
                  className="hidden min-w-0 flex-1 list-none items-center md:flex"
                  aria-hidden
                >
                  <TimelineConnector />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}
