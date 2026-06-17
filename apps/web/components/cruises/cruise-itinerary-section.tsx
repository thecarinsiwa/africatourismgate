'use client';

import { formatPortTime } from '../../lib/cruises/listings';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseSailingDetail } from '../../lib/cruises/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type CruiseItinerarySectionProps = {
  detail: CruiseSailingDetail;
  t: Translations['cruises'];
  locale?: string;
};

export function CruiseItinerarySection({ detail, t, locale }: CruiseItinerarySectionProps) {
  if (!detail.itineraryPorts.length) return null;

  const sortedPorts = [...detail.itineraryPorts].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <section className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6">
      <h2 className="text-lg font-bold text-atg-fg">{t.itineraryTitle}</h2>
      <p className="mt-1 text-sm text-atg-muted">
        {formatCruisePortLabel(detail.sailFromPortCode, detail.sailFromPortName)} →{' '}
        {formatCruisePortLabel(detail.sailToPortCode, detail.sailToPortName)} ·{' '}
        {formatDisplayDate(detail.departureDate, locale)} →{' '}
        {formatDisplayDate(detail.returnDate, locale)}
      </p>

      <ol className="mt-6 space-y-4">
        {sortedPorts.map((stop) => (
          <li
            key={`${stop.dayNumber}-${stop.portCode}`}
            className="relative rounded-xl border border-atg-border bg-atg-surface/80 p-4 dark:border-atg-border dark:bg-white/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.dayLabel.replace('{n}', String(stop.dayNumber))}
                </p>
                <p className="mt-1 text-base font-bold text-atg-fg">
                  {formatCruisePortLabel(stop.portCode, stop.portName)}
                </p>
                <p className="text-sm text-atg-muted">{stop.countryCode}</p>
              </div>
              <div className="text-right text-sm text-atg-muted">
                {stop.arrivalTime && (
                  <p>
                    {t.portArrival}: {formatPortTime(stop.arrivalTime, locale)}
                  </p>
                )}
                {stop.departureTime && (
                  <p className={stop.arrivalTime ? 'mt-1' : undefined}>
                    {t.portDeparture}: {formatPortTime(stop.departureTime, locale)}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
