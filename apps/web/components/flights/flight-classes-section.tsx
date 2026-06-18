'use client';

import type { FlightClassName } from '@africatourismgate/types';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetailClass } from '../../lib/flights/types';
import type { Translations } from '../../lib/i18n/translations';

type FlightClassesSectionProps = {
  classes: FlightDetailClass[];
  currency: string;
  selectedClassId: string | null;
  onSelectClass: (classId: string) => void;
  t: Translations['flights'];
};

function classLabel(t: Translations['flights'], className: FlightClassName): string {
  return t.classNames[className] ?? className;
}

export function FlightClassesSection({
  classes,
  currency,
  selectedClassId,
  onSelectClass,
  t,
}: FlightClassesSectionProps) {
  if (!classes.length) return null;

  return (
    <section id="classes">
      <h2 className="mb-4 text-lg font-bold text-atg-fg">{t.classesTitle}</h2>
      <div className="space-y-4">
        {classes.map((flightClass) => {
          const selected = selectedClassId === flightClass.id;
          const unavailable = flightClass.availableSeats <= 0;

          return (
            <article
              key={flightClass.id}
              className={`rounded-2xl border p-5 transition-colors ${
                selected
                  ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated'
              } ${unavailable ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-atg-fg">
                    {classLabel(t, flightClass.className)}
                  </h3>
                  <p className="mt-1 text-sm text-atg-muted">
                    {t.seatsLeft.replace('{n}', String(flightClass.availableSeats))}
                  </p>
                  <p className="mt-1 text-xs text-atg-muted">
                    {formatFlightPrice(flightClass.priceCents, currency)} {t.perPassenger}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-atg-fg">
                    {formatFlightPrice(flightClass.totalPriceCents, currency)}
                  </p>
                  <p className="text-xs text-atg-muted">{t.totalFlight}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
                {unavailable && (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t.unavailable}
                  </span>
                )}
                <button
                  type="button"
                  disabled={unavailable}
                  onClick={() => onSelectClass(flightClass.id)}
                  className={`ml-auto min-h-[44px] rounded-lg px-5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'bg-primary text-white'
                      : 'border border-atg-border text-atg-fg hover:border-primary hover:text-primary dark:border-atg-border dark:text-white'
                  }`}
                >
                  {t.selectClass}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
