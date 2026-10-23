'use client';

import Link from 'next/link';
import {
  buildActivityDetailHref,
  formatActivityPrice,
  formatDurationMinutes,
  type ActivityDetailSearchParams,
} from '../../lib/activities/listings';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import type { Translations } from '../../lib/i18n/message-types';
import { PriceDisplay } from '../shared';

type ActivityTableProps = {
  activities: ActivitySearchResult[];
  t: Translations['activities'];
  searchParams?: ActivityDetailSearchParams;
};

export function ActivityTable({
  activities,
  t,
  searchParams = {},
}: ActivityTableProps) {
  const ctaLabel = useBookingCtaLabel('activity_schedule');
  const th =
    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-atg-muted';
  const td = 'px-4 py-3 align-middle text-sm text-atg-fg';
  const actionClass =
    'inline-flex min-h-[40px] items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface';

  return (
    <div className="overflow-x-auto rounded-2xl border border-atg-border bg-atg-elevated shadow-sm dark:border-atg-border dark:bg-atg-elevated">
      <table className="min-w-[780px] w-full divide-y divide-atg-border">
        <caption className="sr-only">{t.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>
              {t.tableName}
            </th>
            <th scope="col" className={th}>
              {t.destination}
            </th>
            <th scope="col" className={th}>
              {t.durationLabel}
            </th>
            <th scope="col" className={th}>
              {t.tablePrice}
            </th>
            <th scope="col" className={th}>
              {t.tableAvailability}
            </th>
            <th scope="col" className={`${th} text-right`}>
              {t.tableActions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-atg-border">
          {activities.map((activity) => {
            const effectiveDate =
              searchParams.date ??
              (activity.nextStartDatetime
                ? activity.nextStartDatetime.slice(0, 10)
                : undefined);
            const detailParams: ActivityDetailSearchParams = {
              destination: searchParams.destination ?? activity.destination,
              date: effectiveDate,
              participants: searchParams.participants,
            };
            const detailHref = buildActivityDetailHref(activity.id, detailParams);
            const reserveHref = effectiveDate
              ? buildActivityDetailHref(activity.id, detailParams, '#schedules')
              : detailHref;
            const canBook = Boolean(
              effectiveDate && activity.availableSchedulesCount > 0,
            );
            const durationLabel = formatDurationMinutes(activity.durationMinutes, {
              hourSingular: t.hourSingular,
              hourPlural: t.hourPlural,
              minuteSingular: t.minuteSingular,
              minutePlural: t.minutePlural,
            });
            const schedulesLabel = t.schedulesAvailable.replace(
              '{n}',
              String(activity.availableSchedulesCount),
            );

            return (
              <tr key={activity.id} className="transition-colors hover:bg-primary/5">
                <th scope="row" className={`${td} font-semibold`}>
                  <div className="min-w-0">
                    <p className="line-clamp-2">{activity.title}</p>
                    <p className="mt-0.5 text-xs font-normal text-atg-muted">
                      {activity.providerName}
                    </p>
                  </div>
                </th>
                <td className={td}>{activity.destination || '—'}</td>
                <td className={td}>{durationLabel ?? '—'}</td>
                <td className={td}>
                  <PriceDisplay
                    size="sm"
                    prefixLabel={t.fromPrice}
                    amount={formatActivityPrice(activity.priceCents, activity.currency)}
                    suffixLabel={t.perParticipant}
                  />
                </td>
                <td className={td}>{schedulesLabel}</td>
                <td className={`${td} text-right`}>
                  <div className="inline-flex flex-wrap items-center justify-end gap-2">
                    <Link
                      href={detailHref}
                      className="inline-flex min-h-[40px] items-center rounded-lg border border-atg-border px-3 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80"
                    >
                      {t.viewDetails}
                    </Link>
                    <Link
                      href={reserveHref}
                      className={
                        canBook
                          ? actionClass
                          : `${actionClass} cursor-not-allowed bg-atg-border text-atg-muted hover:bg-atg-border`
                      }
                      aria-disabled={!canBook}
                      tabIndex={!canBook ? -1 : undefined}
                    >
                      {ctaLabel}
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
