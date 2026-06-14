'use client';

import {
  cn,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
} from '@africatourismgate/ui';
import type { ActivitySchedule } from '@africatourismgate/types';
import { useMemo } from 'react';

type ActivitySchedulesTimelineProps = {
  schedules: ActivitySchedule[];
  onEdit: (schedule: ActivitySchedule) => void;
  onDelete: (schedule: ActivitySchedule) => void;
  deletingId: string | null;
  className?: string;
};

function formatDateHeader(isoDate: string): string {
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function ScheduleSlot({
  schedule,
  isLast,
  onEdit,
  onDelete,
  deletingId,
}: {
  schedule: ActivitySchedule;
  isLast: boolean;
  onEdit: (schedule: ActivitySchedule) => void;
  onDelete: (schedule: ActivitySchedule) => void;
  deletingId: string | null;
}) {
  const fillPercent =
    schedule.capacity > 0
      ? Math.min(100, Math.round((schedule.bookedCount / schedule.capacity) * 100))
      : 0;

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
                {formatTime(schedule.startDatetime)}
              </span>
              <DataTableBadge variant="muted">
                {schedule.bookedCount}/{schedule.capacity} places
              </DataTableBadge>
            </div>
            <p className="text-xs text-atg-muted">
              {schedule.bookedCount} réservé{schedule.bookedCount > 1 ? 's' : ''} sur{' '}
              {schedule.capacity}
            </p>
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
            aria-label={`Remplissage du créneau : ${fillPercent} %`}
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
    return (
      <p className="text-sm text-atg-muted">Aucun créneau pour cette activité.</p>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-atg-border bg-atg-surface/50 p-4 sm:p-6',
        className,
      )}
      role="group"
      aria-label="Timeline des créneaux horaires"
    >
      <div className="space-y-8">
        {grouped.map(([dateKey, daySchedules]) => (
          <section key={dateKey} aria-label={formatDateHeader(dateKey)}>
            <h3 className="mb-4 text-sm font-semibold capitalize text-atg-fg">
              {formatDateHeader(dateKey)}
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
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
