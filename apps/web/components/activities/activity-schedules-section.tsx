'use client';

import {
  formatActivityPrice,
  formatScheduleTime,
} from '../../lib/activities/listings';
import type { ActivityScheduleOffer } from '../../lib/activities/types';
import type { Translations } from '../../lib/i18n/translations';

type ActivitySchedulesSectionProps = {
  schedules: ActivityScheduleOffer[];
  currency: string;
  selectedScheduleId: string | null;
  participants: number;
  onSelectSchedule: (scheduleId: string) => void;
  t: Translations['activities'];
  locale?: string;
};

export function ActivitySchedulesSection({
  schedules,
  currency,
  selectedScheduleId,
  participants,
  onSelectSchedule,
  t,
  locale,
}: ActivitySchedulesSectionProps) {
  if (!schedules.length) return null;

  return (
    <section id="schedules">
      <h2 className="mb-4 text-lg font-bold text-atg-fg">{t.schedulesTitle}</h2>
      <div className="space-y-4">
        {schedules.map((schedule) => {
          const selected = selectedScheduleId === schedule.scheduleId;
          const unavailable = schedule.remainingPlaces <= 0;
          const insufficientCapacity = schedule.remainingPlaces < participants;
          const disabled = unavailable || insufficientCapacity;

          return (
            <article
              key={schedule.scheduleId}
              className={`rounded-2xl border p-5 transition-colors ${
                selected
                  ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                  : 'border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated'
              } ${disabled ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-atg-fg">
                    {formatScheduleTime(schedule.startDatetime, locale)}
                  </h3>
                  <p className="mt-1 text-sm text-atg-muted">
                    {t.placesLeft.replace('{n}', String(schedule.remainingPlaces))}
                  </p>
                  <p className="mt-1 text-xs text-atg-muted">
                    {formatActivityPrice(schedule.priceCents, currency)} {t.perParticipant}
                  </p>
                  {insufficientCapacity && !unavailable && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {t.insufficientPlaces}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-atg-fg">
                    {formatActivityPrice(schedule.priceCents * participants, currency)}
                  </p>
                  <p className="text-xs text-atg-muted">{t.totalActivity}</p>
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
                  onClick={() => onSelectSchedule(schedule.scheduleId)}
                  className={`ml-auto min-h-[44px] rounded-lg px-5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'bg-primary text-white'
                      : 'border border-atg-border text-atg-fg hover:border-primary hover:text-primary dark:border-atg-border dark:text-white'
                  }`}
                >
                  {t.selectSchedule}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
