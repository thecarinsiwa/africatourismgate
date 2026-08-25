'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  cn,
  DataTableBadge,
  Skeleton,
} from '@africatourismgate/ui';
import type { GuideCalendarDayStatus, TourGuideCalendarSummaryDay } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CALENDAR_WEEKDAY_HEADERS,
  currentYearMonth,
  enumerateMonthDays,
  formatMonthLabel,
  shiftYearMonth,
  weekdayOffset,
} from '../../lib/availability-dates';
import { getApiClient } from '../../lib/auth/api';
import { TourGuideCalendarDayModal } from './tour-guide-calendar-day-modal';

const STATUS_VARIANTS: Record<GuideCalendarDayStatus, 'success' | 'warning' | 'muted'> = {
  available: 'success',
  occupied: 'warning',
  unavailable: 'muted',
};

function resolveDayStatus(day: TourGuideCalendarSummaryDay): GuideCalendarDayStatus {
  if (day.occupied > 0) return 'occupied';
  if (day.unavailable > 0) return 'unavailable';
  return 'available';
}

type GuidePersonalCalendarProps = {
  guideId: string;
  canWrite: boolean;
};

export function GuidePersonalCalendar({ guideId, canWrite }: GuidePersonalCalendarProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.view.schedule');
  const tCalendar = useTranslations('modules.tourGuides.calendar');
  const tCalendarCommon = useTranslations('modules.common.availabilityCalendar');
  const tDayModal = useTranslations('modules.tourGuides.calendar.dayModal');

  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; days: TourGuideCalendarSummaryDay[] }
  >({ status: 'loading' });

  const monthLabel = useMemo(() => formatMonthLabel(yearMonth), [yearMonth]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const summary = await getApiClient().getTourGuideCalendarSummary({
        month: yearMonth,
        guideId,
      });
      setState({ status: 'ready', days: summary.days });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [getTourGuidesErrorMessage, guideId, yearMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  const dayByDate = useMemo(() => {
    const map = new Map<string, TourGuideCalendarSummaryDay>();
    if (state.status !== 'ready') return map;
    for (const day of state.days) {
      map.set(day.date, day);
    }
    return map;
  }, [state]);

  const calendarCells = useMemo(() => {
    const cells: Array<{ type: 'blank' } | { type: 'day'; date: string }> = [];
    for (let i = 0; i < weekdayOffset(yearMonth); i += 1) {
      cells.push({ type: 'blank' });
    }
    for (const date of enumerateMonthDays(yearMonth)) {
      cells.push({ type: 'day', date });
    }
    return cells;
  }, [yearMonth]);

  const statusLabels: Record<GuideCalendarDayStatus, string> = {
    available: tDayModal('status.available'),
    occupied: tDayModal('status.occupied'),
    unavailable: tDayModal('status.unavailable'),
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
        <p className="mt-0.5 text-xs text-atg-muted">{t('intro')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-atg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-atg-success" aria-hidden />
          {tCalendar('legendAvailable')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          {tCalendar('legendOccupied')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-atg-muted" aria-hidden />
          {tCalendar('legendUnavailable')}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={tCalendarCommon('previousMonth')}
            onClick={() => setYearMonth(shiftYearMonth(yearMonth, -1))}
          >
            ‹
          </Button>
          <h4
            className="min-w-[10rem] text-center text-sm font-semibold text-atg-fg"
            aria-live="polite"
          >
            {monthLabel}
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={tCalendarCommon('nextMonth')}
            onClick={() => setYearMonth(shiftYearMonth(yearMonth, 1))}
          >
            ›
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setYearMonth(currentYearMonth())}
        >
          {tCalendar('today')}
        </Button>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="md">
          {state.status === 'loading' ? (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="min-h-[4.5rem] rounded-lg sm:min-h-[5rem]" />
              ))}
            </div>
          ) : (
            <div
              role="grid"
              aria-label={t('ariaLabel', { month: monthLabel })}
              className="grid grid-cols-7 gap-1 sm:gap-2"
            >
              {CALENDAR_WEEKDAY_HEADERS.map((label) => (
                <div
                  key={label}
                  role="columnheader"
                  className="py-1 text-center text-xs font-medium uppercase tracking-wide text-atg-muted"
                >
                  {label}
                </div>
              ))}

              {calendarCells.map((cell, index) => {
                if (cell.type === 'blank') {
                  return (
                    <div
                      key={`blank-${index}`}
                      role="gridcell"
                      aria-hidden
                      className="min-h-[4.5rem] rounded-lg sm:min-h-[5rem]"
                    />
                  );
                }

                const dayNum = Number(cell.date.split('-')[2]);
                const summary = dayByDate.get(cell.date);
                const dayStatus = summary ? resolveDayStatus(summary) : 'available';
                const isToday = cell.date === new Date().toISOString().slice(0, 10);

                return (
                  <button
                    key={cell.date}
                    type="button"
                    role="gridcell"
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      'flex min-h-[4.5rem] flex-col rounded-lg border border-atg-border/60 bg-atg-elevated p-1.5 text-left transition-colors hover:border-primary/40 hover:bg-atg-surface sm:min-h-[5rem] sm:p-2',
                      isToday && 'ring-2 ring-primary/40',
                    )}
                  >
                    <span className="text-xs font-semibold tabular-nums text-atg-fg">{dayNum}</span>
                    {summary ? (
                      <DataTableBadge
                        variant={STATUS_VARIANTS[dayStatus]}
                        className="mt-1.5 w-fit text-[10px] sm:text-xs"
                      >
                        {statusLabels[dayStatus]}
                      </DataTableBadge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <TourGuideCalendarDayModal
        open={selectedDate != null}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
        date={selectedDate}
        guideId={guideId}
        canWrite={canWrite}
        onUpdated={() => void load()}
      />
    </section>
  );
}
