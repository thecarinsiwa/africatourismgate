'use client';

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

  return (
    <section id="cabins">
      <h2 className="mb-4 text-lg font-bold text-atg-fg">{t.cabinsTitle}</h2>
      <div className="space-y-4">
        {cabins.map((cabin) => {
          const selected = selectedAvailabilityId === cabin.availabilityId;
          const unavailable = cabin.availableCount <= 0;
          const insufficientCapacity = cabin.maxGuests < guests;
          const disabled = unavailable || insufficientCapacity;

          return (
            <article
              key={cabin.availabilityId}
              className={`rounded-2xl border p-5 transition-colors ${
                selected
                  ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated'
              } ${disabled ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-atg-fg">
                    {cabin.categoryName}
                  </h3>
                  <p className="mt-1 text-sm text-atg-muted">
                    {t.cabinsLeft.replace('{n}', String(cabin.availableCount))}
                  </p>
                  <p className="mt-1 text-xs text-atg-muted">
                    {formatCruisePrice(cabin.priceCents, currency)} {t.perGuest}
                  </p>
                  {insufficientCapacity && !unavailable && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {t.insufficientCabins}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-atg-fg">
                    {formatCruisePrice(cabin.priceCents, currency)}
                  </p>
                  <p className="text-xs text-atg-muted">{t.totalCruise}</p>
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
                  disabled={disabled}
                  onClick={() => onSelectCabin(cabin.availabilityId)}
                  className={`ml-auto min-h-[44px] rounded-lg px-5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'bg-primary text-white'
                      : 'border border-atg-border text-atg-fg hover:border-primary hover:text-primary dark:border-atg-border dark:text-white'
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
