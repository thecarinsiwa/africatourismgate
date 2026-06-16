'use client';

import {
  cn,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
} from '@africatourismgate/ui';
import type { ActivitySchedule } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

type ActivitySchedulesTimelineProps = {
  schedules: ActivitySchedule[];
  onEdit: (schedule: ActivitySchedule) => void;
  onDelete: (schedule: ActivitySchedule) => void;
  deletingId: string | null;
  className?: string;
};

function ScheduleSlot({
  schedule,
  isLast,
  onEdit,
  onDelete,
  deletingId,
  locale,
  placesBadge,
  bookedSummary,
  fillAria,
}: {
  schedule: ActivitySchedule;
  isLast: boolean;
  onEdit: (schedule: ActivitySchedule) => void;
  onDelete: (schedule: ActivitySchedule) => void;
  deletingId: string | null;
  locale: string;
  placesBadge: string;
  bookedSummary: string;
  fillAria: string;
}) {
  const fillPercent =
    schedule.capacity > 0
      ? Math.min(100, Math.round((schedule.bookedCount / schedule.capacity) * 100))
      : 0;

  const timeLabel = new Date(schedule.startDatetime).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center" aria-hidden>
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />
        {!isLast ? <div className="mt-1 w-px flex-1 bg-atg-border" /> : null}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tabular-nums text-atg-fg">
                {timeLabel}
              </span>
              <DataTableBadge variant="muted">
                {placesBadge}
              </DataTableBadge>
            </div>
            <p className="text-xs text-atg-muted">{bookedSummary}</p>
          </div>
          <DataTableActions>
            <DataTableActionButton action="edit" onClick={() => onEdit(schedule)} />
            <DataTableActionButton
              action="delete"
              onClick={() => void onDelete(schedule)}
              disabled={deletingId === schedule.id}
              loading={deletingId === schedule.id}
            />
          </DataTableActions>
        </div>

        <div className="space-y-1">
          <div
            className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-atg-border/80"
            role="progressbar"
            aria-valuenow={fillPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={fillAria}
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width]',
                fillPercent >= 100 ? 'bg-atg-warning' : 'bg-primary',
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivitySchedulesTimeline({
  schedules,
  onEdit,
  onDelete,
  deletingId,
  className,
}: ActivitySchedulesTimelineProps) {
  const locale = useLocale();
  const t = useTranslations('modules.activities.sections.schedules');

  const grouped = useMemo(() => {
    const sorted = [...schedules].sort(
      (a, b) =>
        new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime(),
    );
    const map = new Map<string, ActivitySchedule[]>();
    for (const schedule of sorted) {
      const dateKey = schedule.startDatetime.slice(0, 10);
      const list = map.get(dateKey) ?? [];
      list.push(schedule);
      map.set(dateKey, list);
    }
    return Array.from(map.entries());
  }, [schedules]);

  if (grouped.length === 0) {
    return <p className="text-sm text-atg-muted">{t('empty')}</p>;
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-atg-border bg-atg-surface/50 p-4 sm:p-6',
        className,
      )}
      role="group"
      aria-label={t('timelineAria')}
    >
      <div className="space-y-8">
        {grouped.map(([dateKey, daySchedules]) => {
          const dateHeader = new Date(`${dateKey}T12:00:00`).toLocaleDateString(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          return (
            <section key={dateKey} aria-label={dateHeader}>
              <h3 className="mb-4 text-sm font-semibold capitalize text-atg-fg">
                {dateHeader}
              </h3>
              <div>
                {daySchedules.map((schedule, index) => (
                  <ScheduleSlot
                    key={schedule.id}
                    schedule={schedule}
                    isLast={index === daySchedules.length - 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    deletingId={deletingId}
                    locale={locale}
                    placesBadge={t('placesBadge', {
                      booked: schedule.bookedCount,
                      capacity: schedule.capacity,
                    })}
                    bookedSummary={t('bookedSummary', {
                      booked: schedule.bookedCount,
                      capacity: schedule.capacity,
                    })}
                    fillAria={t('fillAria', { percent: fillPercentFor(schedule) })}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function fillPercentFor(schedule: ActivitySchedule): number {
  return schedule.capacity > 0
    ? Math.min(100, Math.round((schedule.bookedCount / schedule.capacity) * 100))
    : 0;
}
