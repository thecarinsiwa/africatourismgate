'use client';

import type { KeyboardEvent } from 'react';
import { resolveCabinDeck } from '../../lib/cruises/cabins';
import { formatCruisePrice } from '../../lib/cruises/listings';
import type { CruiseCabinOffer } from '../../lib/cruises/types';
import type { Translations } from '../../lib/i18n/translations';

type CruiseCabinsSectionProps = {
  cabins: CruiseCabinOffer[];
  currency: string;
  selectedAvailabilityId: string | null;
  guests: number;
  onSelectCabin: (availabilityId: string) => void;
  t: Translations['cruises'];
};

export function CruiseCabinsSection({
  cabins,
  currency,
  selectedAvailabilityId,
  guests,
  onSelectCabin,
  t,
}: CruiseCabinsSectionProps) {
  if (!cabins.length) return null;

  const headingId = 'cruise-cabins-heading';

  return (
    <section
      id="cabins"
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="mb-4 text-lg font-bold text-atg-fg">
        {t.cabinsTitle}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {cabins.map((cabin) => {
          const selected = selectedAvailabilityId === cabin.availabilityId;
          const unavailable = cabin.availableCount <= 0;
          const insufficientCapacity = cabin.maxGuests < guests;
          const disabled = unavailable || insufficientCapacity;
          const deckKey = resolveCabinDeck(cabin.categoryName);

          function handleSelect() {
            if (!disabled) onSelectCabin(cabin.availabilityId);
          }

          function handleKeyDown(event: KeyboardEvent) {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelectCabin(cabin.availabilityId);
            }
          }

          return (
            <article
              key={cabin.availabilityId}
              role="radio"
              aria-checked={selected}
              tabIndex={disabled ? -1 : selected ? 0 : -1}
              onClick={handleSelect}
              onKeyDown={handleKeyDown}
              className={`flex h-full cursor-pointer flex-col rounded-2xl border p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-surface hover:border-primary/40 dark:border-atg-border dark:bg-atg-surface'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-atg-fg">{cabin.categoryName}</h3>
                    <p className="mt-1 text-sm text-atg-muted">
                      {t.deckLabel}: {t.deck[deckKey]}
                    </p>
                  </div>
                  {selected ? (
                    <span className="inline-flex shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                      {t.selectedCabin}
                    </span>
                  ) : null}
                </div>

                <ul className="space-y-1.5 text-sm text-atg-muted">
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {t.capacityLabel.replace('{n}', String(cabin.maxGuests))}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    {t.cabinsLeft.replace('{n}', String(cabin.availableCount))}
                  </li>
                </ul>

                {insufficientCapacity && !unavailable ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{t.insufficientCabins}</p>
                ) : null}

                <div className="mt-auto">
                  <p className="text-xs uppercase tracking-wide text-atg-muted">{t.fromPrice}</p>
                  <p className="text-2xl font-bold text-atg-fg">
                    {formatCruisePrice(cabin.priceCents, currency)}
                  </p>
                  <p className="text-xs text-atg-muted">{t.perGuest}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
                {unavailable ? (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t.unavailable}
                  </span>
                ) : (
                  <span className="sr-only">
                    {selected ? t.selectedCabin : cabin.categoryName}
                  </span>
                )}
                <button
                  type="button"
                  disabled={disabled}
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
                  {t.selectCabin}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
