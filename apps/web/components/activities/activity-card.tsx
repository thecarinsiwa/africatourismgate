'use client';

import Link from 'next/link';
import {
  buildActivityDetailHref,
  formatActivityPrice,
  formatDurationMinutes,
  formatScheduleTime,
  type ActivityDetailSearchParams,
} from '../../lib/activities/listings';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type ActivityCardProps = {
  activity: ActivitySearchResult;
  t: Translations['activities'];
  searchParams?: ActivityDetailSearchParams;
  locale?: string;
};

export function ActivityCard({ activity, t, searchParams = {}, locale }: ActivityCardProps) {
  const effectiveDate =
    searchParams.date ??
    (activity.nextStartDatetime ? activity.nextStartDatetime.slice(0, 10) : undefined);

  const detailParams: ActivityDetailSearchParams = {
    destination: searchParams.destination ?? activity.destination,
    date: effectiveDate,
    participants: searchParams.participants,
  };
  const detailHref = buildActivityDetailHref(activity.id, detailParams);
  const reserveHref = effectiveDate
    ? buildActivityDetailHref(activity.id, detailParams, '#schedules')
    : detailHref;

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
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex shrink-0 flex-col justify-center bg-gradient-to-br from-emerald-900 to-primary/80 px-6 py-8 text-white sm:w-56 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {activity.destination}
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">{activity.title}</p>
          <p className="mt-2 text-sm text-white/80">{activity.providerName}</p>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {durationLabel && (
                <p className="text-sm font-medium text-primary">
                  {t.durationLabel}: {durationLabel}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                {searchParams.date
                  ? `${formatDisplayDate(searchParams.date, locale)} · ${schedulesLabel}`
                  : schedulesLabel}
              </p>
              {activity.nextStartDatetime ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-atg-muted">
                  {t.nextSlot}: {formatScheduleTime(activity.nextStartDatetime, locale)}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500 dark:text-atg-muted">{t.noUpcomingSlot}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-atg-muted">
                {t.fromPrice}
              </p>
              <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">
                {formatActivityPrice(activity.priceCents, activity.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-atg-muted">{t.perParticipant}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-end gap-2 border-t border-gray-100 pt-4 dark:border-atg-border">
            <Link
              href={detailHref}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
            >
              {t.viewDetails}
            </Link>
            <Link
              href={reserveHref}
              className={`inline-flex min-h-[44px] items-center rounded-lg px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                effectiveDate && activity.availableSchedulesCount > 0
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-atg-surface dark:text-atg-muted'
              }`}
              aria-disabled={!effectiveDate || activity.availableSchedulesCount === 0}
              tabIndex={!effectiveDate || activity.availableSchedulesCount === 0 ? -1 : undefined}
            >
              {t.bookNow}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
