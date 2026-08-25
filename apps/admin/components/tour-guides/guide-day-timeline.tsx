'use client';

import { cn } from '@africatourismgate/ui';
import type { GuideCalendarScheduleSlot } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export type GuideDayTimelineSlot = GuideCalendarScheduleSlot & {
  label?: string;
};

type GuideDayTimelineProps = {
  date: string;
  slots: GuideDayTimelineSlot[];
  className?: string;
  compact?: boolean;
};

const BAR_STYLES: Record<GuideDayTimelineSlot['type'], string> = {
  assignment: 'bg-amber-400 dark:bg-amber-500',
  unavailable: 'bg-atg-muted/70 dark:bg-atg-muted',
};

function minutesOnDay(iso: string, date: string): number {
  const day = date.slice(0, 10);
  const value = new Date(iso);
  const dayStart = new Date(`${day}T00:00:00`);
  const dayEnd = new Date(`${day}T23:59:59`);
  const clamped = Math.min(Math.max(value.getTime(), dayStart.getTime()), dayEnd.getTime());
  return (clamped - dayStart.getTime()) / 60_000;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function GuideDayTimeline({ date, slots, className, compact = false }: GuideDayTimelineProps) {
  const t = useTranslations('modules.tourGuides.calendar.timeline');

  const positioned = useMemo(() => {
    const dayMinutes = 24 * 60;
    return slots.map((slot) => {
      const startMin = minutesOnDay(slot.startDatetime, date);
      const endMin = Math.max(startMin + 5, minutesOnDay(slot.endDatetime, date));
      const left = (startMin / dayMinutes) * 100;
      const width = Math.max(((endMin - startMin) / dayMinutes) * 100, 1.5);
      return { slot, left, width };
    });
  }, [date, slots]);

  const hourTicks = [0, 6, 12, 18];

  return (
    <div className={cn('space-y-1', className)}>
      <div className="relative h-7 rounded-md bg-atg-elevated ring-1 ring-inset ring-atg-border">
        {hourTicks.map((hour) => (
          <span
            key={hour}
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-atg-border/60"
            style={{ left: `${(hour / 24) * 100}%` }}
          />
        ))}
        {positioned.map(({ slot, left, width }) => (
          <span
            key={`${slot.type}-${slot.startDatetime}-${slot.assignmentId ?? slot.availabilityId ?? ''}`}
            title={`${slot.type === 'assignment' ? t('assignment') : t('unavailable')} · ${formatTime(slot.startDatetime)} – ${formatTime(slot.endDatetime)}`}
            className={cn('absolute top-1 bottom-1 rounded-sm', BAR_STYLES[slot.type])}
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        ))}
      </div>
      {!compact ? (
        <div className="flex justify-between text-[10px] text-atg-muted">
          {hourTicks.map((hour) => (
            <span key={hour}>{String(hour).padStart(2, '0')}h</span>
          ))}
          <span>24h</span>
        </div>
      ) : null}
      {slots.length > 0 ? (
        <ul className="space-y-1 text-xs text-atg-muted">
          {slots.map((slot) => (
            <li key={`${slot.type}-${slot.startDatetime}`} className="flex flex-wrap gap-x-2">
              <span className="font-medium text-atg-fg">
                {slot.type === 'assignment' ? t('assignment') : t('unavailable')}
              </span>
              <span>
                {formatTime(slot.startDatetime)} – {formatTime(slot.endDatetime)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-atg-muted">{t('empty')}</p>
      )}
    </div>
  );
}

/** Combine date YYYY-MM-DD and time HH:mm into ISO for API. */
export function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date.slice(0, 10)}T${time}`).toISOString();
}
