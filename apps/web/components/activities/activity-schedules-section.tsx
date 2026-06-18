'use client';

import { EmptyState } from '@africatourismgate/ui';
import {
  formatActivityPrice,
  formatScheduleTime,
} from '../../lib/activities/listings';
import type { ActivityScheduleOffer } from '../../lib/activities/types';
import type { Translations } from '../../lib/i18n/translations';
import { ListingDefaultEmptyIcon } from '../shared';

type ActivitySchedulesSectionProps = {
  schedules: ActivityScheduleOffer[];
  currency: string;
  selectedScheduleId: string | null;
  participants: number;
  onSelectSchedule: (scheduleId: string) => void;
  t: Translations['activities'];
  locale?: string;
  listHref?: string;
  hideTitle?: boolean;
};

function ScheduleChip({
  schedule,
  currency,
  participants,
  selected,
  onSelect,
  t,
  locale,
}: {
  schedule: ActivityScheduleOffer;
  currency: string;
  participants: number;
  selected: boolean;
  onSelect: () => void;
  t: Translations['activities'];
  locale?: string;
}) {
  const timeLabel = formatScheduleTime(schedule.startDatetime, locale);
  const unavailable = schedule.remainingPlaces <= 0;
  const insufficientCapacity =
    !unavailable && schedule.remainingPlaces < participants;
  const disabled = unavailable || insufficientCapacity;

  const statusLabel = unavailable
    ? t.unavailable
    : insufficientCapacity
      ? t.insufficientPlaces
      : t.placesLeft.replace('{n}', String(schedule.remainingPlaces));

  const ariaLabel = `${timeLabel} — ${statusLabel} — ${formatActivityPrice(schedule.priceCents, currency)} ${t.perParticipant}`;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onSelect}
      className={`inline-flex min-h-[44px] shrink-0 flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed ${
        selected
          ? 'border-primary bg-primary/10 ring-1 ring-primary/20 dark:border-primary dark:bg-primary/15'
          : 'border-atg-border bg-atg-elevated hover:border-primary/60 dark:border-atg-border dark:bg-atg-elevated'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span className="text-sm font-bold text-atg-fg">{timeLabel}</span>
      <span className="mt-0.5 text-xs text-atg-muted">
        {formatActivityPrice(schedule.priceCents, currency)} {t.perParticipant}
      </span>
      <span
        className={`mt-1 text-xs font-medium ${
          unavailable
            ? 'text-red-600 dark:text-red-400'
            : insufficientCapacity
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-atg-muted'
        }`}
      >
        {statusLabel}
      </span>
    </button>
  );
}

export function ActivitySchedulesSection({
  schedules,
  currency,
  selectedScheduleId,
  participants,
  onSelectSchedule,
  t,
  locale,
  listHref,
  hideTitle = false,
}: ActivitySchedulesSectionProps) {
  const selectedSchedule =
    schedules.find((schedule) => schedule.scheduleId === selectedScheduleId) ?? null;

  if (!schedules.length) {
    return (
      <section id="schedules">
        {!hideTitle ? (
          <h2 className="mb-4 text-lg font-bold text-atg-fg">{t.schedulesTitle}</h2>
        ) : null}
        <EmptyState
          title={t.noSchedulesTitle}
          description={t.noSchedulesHint}
          icon={<ListingDefaultEmptyIcon />}
          action={
            listHref ? (
              <a
                href={listHref}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
              >
                {t.modifySearch}
              </a>
            ) : undefined
          }
          className="rounded-2xl border-atg-border bg-atg-elevated dark:bg-atg-elevated"
        />
      </section>
    );
  }

  return (
    <section id="schedules">
      {!hideTitle ? (
        <h2 className="mb-4 text-lg font-bold text-atg-fg">{t.schedulesTitle}</h2>
      ) : null}

      <div
        role="radiogroup"
        aria-label={t.schedulesTitle}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible"
      >
        {schedules.map((schedule) => (
          <ScheduleChip
            key={schedule.scheduleId}
            schedule={schedule}
            currency={currency}
            participants={participants}
            selected={selectedScheduleId === schedule.scheduleId}
            onSelect={() => onSelectSchedule(schedule.scheduleId)}
            t={t}
            locale={locale}
          />
        ))}
      </div>

      {selectedSchedule ? (
        <div className="mt-4 rounded-2xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
                {t.selectedScheduleLabel}
              </p>
              <p className="mt-1 text-base font-bold text-atg-fg">
                {formatScheduleTime(selectedSchedule.startDatetime, locale)}
              </p>
              <p className="mt-1 text-sm text-atg-muted">
                {t.placesLeft.replace('{n}', String(selectedSchedule.remainingPlaces))}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wide text-atg-muted">{t.totalActivity}</p>
              <p className="text-2xl font-bold text-atg-fg">
                {formatActivityPrice(
                  selectedSchedule.priceCents * participants,
                  currency,
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-atg-muted">{t.selectScheduleHint}</p>
      )}
    </section>
  );
}
