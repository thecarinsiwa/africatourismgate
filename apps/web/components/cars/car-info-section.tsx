'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type CarInfoSectionProps = {
  title: string;
  categoryName: string;
  exampleModel?: string | null;
  licensePlate?: string | null;
  agencyName: string;
  agencyCity?: string;
  agencyAddress?: string | null;
  pickupLocation?: string;
  pickupDate: string;
  returnDate: string;
  daysLabel: string;
  t: Translations['cars'];
  locale?: string;
};

export function CarInfoSection({
  title,
  categoryName,
  exampleModel,
  licensePlate,
  agencyName,
  agencyCity,
  agencyAddress,
  pickupLocation,
  pickupDate,
  returnDate,
  daysLabel,
  t,
  locale,
}: CarInfoSectionProps) {
  return (
    <section
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-labelledby="car-info-heading"
    >
      <h2 id="car-info-heading" className="text-lg font-bold text-atg-fg">
        {title}
      </h2>

      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t.categoryTitle}
          </dt>
          <dd className="mt-1 font-medium text-atg-fg">
            {categoryName}
            {exampleModel ? ` · ${exampleModel}` : ''}
          </dd>
        </div>

        {licensePlate ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {t.licensePlate}
            </dt>
            <dd className="mt-1 font-medium text-atg-fg">{licensePlate}</dd>
          </div>
        ) : null}

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t.agencyTitle}
          </dt>
          <dd className="mt-1 font-medium text-atg-fg">{agencyName}</dd>
          {agencyCity ? (
            <dd className="mt-1 flex items-center gap-1.5 text-atg-muted">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {agencyCity}
            </dd>
          ) : null}
          {agencyAddress ? (
            <dd className="mt-1 text-atg-muted">{agencyAddress}</dd>
          ) : null}
        </div>

        {pickupLocation ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {t.pickupLocation}
            </dt>
            <dd className="mt-1 font-medium text-atg-fg">{pickupLocation}</dd>
          </div>
        ) : null}

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t.rentalPeriod}
          </dt>
          <dd className="mt-1 font-medium text-atg-fg">
            {formatDisplayDate(pickupDate, locale)} → {formatDisplayDate(returnDate, locale)}
          </dd>
          <dd className="mt-0.5 text-atg-muted">{daysLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
