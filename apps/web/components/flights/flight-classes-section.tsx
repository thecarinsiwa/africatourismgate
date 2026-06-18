'use client';

import type { KeyboardEvent } from 'react';
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

  const headingId = 'flight-classes-heading';

  return (
    <section
      id="classes"
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="mb-4 text-lg font-bold text-atg-fg">
        {t.classesTitle}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {classes.map((flightClass) => {
          const selected = selectedClassId === flightClass.id;
          const unavailable = flightClass.availableSeats <= 0;

          function handleSelect() {
            if (!unavailable) onSelectClass(flightClass.id);
          }

          function handleKeyDown(event: KeyboardEvent) {
            if (unavailable) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelectClass(flightClass.id);
            }
          }

          return (
            <article
              key={flightClass.id}
              role="radio"
              aria-checked={selected}
              tabIndex={unavailable ? -1 : selected ? 0 : -1}
              onClick={handleSelect}
              onKeyDown={handleKeyDown}
              className={`flex h-full cursor-pointer flex-col rounded-2xl border p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-surface hover:border-primary/40 dark:border-atg-border dark:bg-atg-surface'
              } ${unavailable ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-atg-fg">
                      {classLabel(t, flightClass.className)}
                    </h3>
                    <p className="mt-1 text-sm text-atg-muted">
                      {t.seatsLeft.replace('{n}', String(flightClass.availableSeats))}
                    </p>
                  </div>
                  {selected ? (
                    <span className="inline-flex shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                      {t.selectedClass}
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto space-y-1">
                  <p className="text-2xl font-bold text-atg-fg">
                    {formatFlightPrice(flightClass.totalPriceCents, currency)}
                  </p>
                  <p className="text-xs text-atg-muted">
                    {formatFlightPrice(flightClass.priceCents, currency)} {t.perPassenger} ·{' '}
                    {t.totalFlight}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
                {unavailable ? (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t.unavailable}
                  </span>
                ) : (
                  <span className="sr-only">
                    {selected ? t.selectedClass : classLabel(t, flightClass.className)}
                  </span>
                )}
                <button
                  type="button"
                  disabled={unavailable}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelect();
                  }}
                  className={`ml-auto min-h-[44px] rounded-lg px-5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'bg-primary text-white'
                      : 'border border-atg-border text-atg-fg hover:border-primary hover:text-primary dark:border-atg-border dark:text-atg-fg'
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
