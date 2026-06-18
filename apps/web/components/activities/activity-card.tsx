'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  buildActivityDetailHref,
  formatActivityPrice,
  formatDurationMinutes,
  formatScheduleTime,
  type ActivityDetailSearchParams,
} from '../../lib/activities/listings';
import {
  getActivityDifficultyBadgeClass,
  getActivityDifficultyLabel,
} from '../../lib/activities/difficulty';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';
import { PriceDisplay, ProductCard, StarRating } from '../shared';

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

  const difficultyLabel = getActivityDifficultyLabel(activity.difficultyLevel, {
    easy: t.difficultyEasy,
    moderate: t.difficultyModerate,
    hard: t.difficultyHard,
    expert: t.difficultyExpert,
  });

  const hasRating =
    activity.reviewCount != null &&
    activity.reviewCount > 0 &&
    activity.averageRating != null;

  const schedulesLabel = t.schedulesAvailable.replace(
    '{n}',
    String(activity.availableSchedulesCount),
  );

  const canBook = Boolean(effectiveDate && activity.availableSchedulesCount > 0);

  const imageOverlay = (
    <div className="absolute inset-0 flex flex-col justify-center px-6 py-8 text-white">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
        {activity.destination}
      </p>
      <p className="mt-1 text-xl font-bold leading-tight">{activity.title}</p>
      <p className="mt-2 text-sm text-white/80">{activity.providerName}</p>
    </div>
  );

  return (
    <ProductCard
      image={
        activity.imageUrl ? (
          <>
            <Image
              src={activity.imageUrl}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {imageOverlay}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-emerald-900 to-primary/80 px-6 py-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {activity.destination}
            </p>
            <p className="mt-1 text-xl font-bold leading-tight">{activity.title}</p>
            <p className="mt-2 text-sm text-white/80">{activity.providerName}</p>
          </div>
        )
      }
      title={
        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">{activity.title}</h3>
      }
      meta={
        <>
          <div className="flex flex-wrap items-center gap-2">
            {durationLabel ? (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {durationLabel}
              </span>
            ) : null}
            {activity.difficultyLevel && difficultyLabel ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActivityDifficultyBadgeClass(activity.difficultyLevel)}`}
              >
                {difficultyLabel}
              </span>
            ) : null}
            {hasRating ? (
              <span className="inline-flex items-center gap-1.5">
                <StarRating
                  value={activity.averageRating!}
                  size="sm"
                  ariaLabel={t.ratingAria.replace('{rating}', activity.averageRating!.toFixed(1))}
                />
                <span className="text-xs font-medium text-atg-muted">
                  {activity.averageRating!.toFixed(1)}
                  {activity.reviewCount! > 0
                    ? ` (${t.reviewCount.replace('{n}', String(activity.reviewCount))})`
                    : ''}
                </span>
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-atg-muted">
            {searchParams.date
              ? `${formatDisplayDate(searchParams.date, locale)} · ${schedulesLabel}`
              : schedulesLabel}
          </p>
          {activity.nextStartDatetime ? (
            <p className="mt-1 text-sm text-atg-muted">
              {t.nextSlot}: {formatScheduleTime(activity.nextStartDatetime, locale)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-atg-muted">{t.noUpcomingSlot}</p>
          )}
        </>
      }
      price={
        <PriceDisplay
          prefixLabel={t.fromPrice}
          amount={formatActivityPrice(activity.priceCents, activity.currency)}
          suffixLabel={t.perParticipant}
        />
      }
      actions={
        <>
          <Link
            href={detailHref}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
          >
            {t.viewDetails}
          </Link>
          <Link
            href={reserveHref}
            className={`inline-flex min-h-[44px] items-center rounded-lg px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
              canBook
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'cursor-not-allowed bg-atg-border text-atg-muted dark:bg-atg-surface'
            }`}
            aria-disabled={!canBook}
            tabIndex={!canBook ? -1 : undefined}
          >
            {t.bookNow}
          </Link>
        </>
      }
    />
  );
}
