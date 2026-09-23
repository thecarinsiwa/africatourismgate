'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  cn,
  DataTableBadge,
  Select,
  Skeleton,
} from '@africatourismgate/ui';
import type {
  Destination,
  OrganizationListItem,
  TourGuideCalendarSummaryDay,
} from '@africatourismgate/types';
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

export function TourGuidesCalendarView() {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.calendar');
  const tDestColumns = useTranslations('modules.destinations.columns');
  const tUsersFilters = useTranslations('modules.users.filters');
  const tCommon = useTranslations('modules.common');
  const tCalendar = useTranslations('modules.common.availabilityCalendar');

  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [destinationFilter, setDestinationFilter] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; days: TourGuideCalendarSummaryDay[] }
  >({ status: 'loading' });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  const monthLabel = useMemo(() => formatMonthLabel(yearMonth), [yearMonth]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('guides.write'));
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadLookups() {
      try {
        const client = getApiClient();
        const [destinationsResult, organizationsResult] = await Promise.all([
          client.listDestinations({ page: 1, limit: 100 }),
          client.listOrganizations({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setDestinations(destinationsResult.data);
          setOrganizations(organizationsResult.data);
        }
      } catch {
        if (!cancelled) {
          setDestinations([]);
          setOrganizations([]);
        }
      }
    }
    void loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...destinations.map((destination) => ({
        value: destination.id,
        label: destination.name,
      })),
    ],
    [destinations, tCommon],
  );

  const organizationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations, tCommon],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const summary = await getApiClient().getTourGuideCalendarSummary({
        month: yearMonth,
        destinationId: destinationFilter || undefined,
        organizationId: organizationFilter || undefined,
      });
      setState({ status: 'ready', days: summary.days });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [
    destinationFilter,
    getTourGuidesErrorMessage,
    organizationFilter,
    yearMonth,
  ]);

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

  const totalActiveGuides =
    state.status === 'ready' && state.days.length > 0
      ? state.days[0]?.totalActive ?? 0
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="w-full sm:w-56">
          <Select
            label={tDestColumns('destination')}
            value={destinationFilter}
            options={destinationOptions}
            onChange={(e) => setDestinationFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            label={tUsersFilters('organization')}
            value={organizationFilter}
            options={organizationOptions}
            onChange={(e) => setOrganizationFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-atg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-atg-success" aria-hidden />
          {t('legendAvailable')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          {t('legendOccupied')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-atg-muted" aria-hidden />
          {t('legendUnavailable')}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <span className="h-2.5 w-6 rounded-sm bg-amber-400" aria-hidden />
          {t('legendTimelineAssignment')}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <span className="h-2.5 w-6 rounded-sm bg-atg-muted/70" aria-hidden />
          {t('legendTimelineUnavailable')}
        </span>
        {state.status === 'ready' ? (
          <span className="text-atg-muted">
            {t('activeGuidesCount', { count: totalActiveGuides })}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={tCalendar('previousMonth')}
            onClick={() => setYearMonth(shiftYearMonth(yearMonth, -1))}
          >
            ‹
          </Button>
          <h3
            className="min-w-[10rem] text-center text-sm font-semibold text-atg-fg"
            aria-live="polite"
          >
            {monthLabel}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={tCalendar('nextMonth')}
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
          {t('today')}
        </Button>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="md" className="overflow-hidden">
          {state.status === 'loading' ? (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="min-h-[3.75rem] rounded-lg sm:min-h-[6rem]" />
              ))}
            </div>
          ) : totalActiveGuides === 0 ? (
            <p className="text-sm text-atg-muted">{t('noActiveGuides')}</p>
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
                  className="truncate py-1 text-center text-[10px] font-medium uppercase tracking-wide text-atg-muted sm:text-xs"
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
                      className="min-h-[3.75rem] rounded-lg sm:min-h-[6rem]"
                    />
                  );
                }

                const dayNum = Number(cell.date.split('-')[2]);
                const summary = dayByDate.get(cell.date);
                const isToday = cell.date === new Date().toISOString().slice(0, 10);
                const ariaParts = summary
                  ? [
                      t('availableShort', { count: summary.available }),
                      summary.occupied > 0
                        ? t('occupiedShort', { count: summary.occupied })
                        : null,
                      summary.unavailable > 0
                        ? t('unavailableShort', { count: summary.unavailable })
                        : null,
                    ].filter(Boolean)
                  : [];

                return (
                  <button
                    key={cell.date}
                    type="button"
                    role="gridcell"
                    aria-label={
                      ariaParts.length > 0
                        ? `${dayNum}, ${ariaParts.join(', ')}`
                        : String(dayNum)
                    }
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      'flex min-h-[3.75rem] min-w-0 flex-col overflow-hidden rounded-lg border border-atg-border/60 bg-atg-elevated p-1 text-left transition-colors hover:border-primary/40 hover:bg-atg-surface sm:min-h-[6rem] sm:p-2',
                      isToday && 'ring-2 ring-primary/40',
                    )}
                  >
                    <span className="text-[11px] font-semibold tabular-nums text-atg-fg sm:text-xs">
                      {dayNum}
                    </span>
                    {summary ? (
                      <>
                        {/* Mobile: compact count chips (full labels overflow 7-col grid) */}
                        <div
                          aria-hidden
                          className="mt-auto flex flex-wrap gap-0.5 sm:hidden"
                        >
                          <span className="inline-flex min-w-[1.1rem] items-center justify-center rounded bg-atg-success-light px-0.5 text-[10px] font-bold tabular-nums text-atg-success-fg">
                            {summary.available}
                          </span>
                          {summary.occupied > 0 ? (
                            <span className="inline-flex min-w-[1.1rem] items-center justify-center rounded bg-atg-warning-light px-0.5 text-[10px] font-bold tabular-nums text-atg-warning-fg">
                              {summary.occupied}
                            </span>
                          ) : null}
                          {summary.unavailable > 0 ? (
                            <span className="inline-flex min-w-[1.1rem] items-center justify-center rounded bg-atg-border/50 px-0.5 text-[10px] font-bold tabular-nums text-atg-muted">
                              {summary.unavailable}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1.5 hidden flex-col gap-1 sm:flex">
                          <DataTableBadge
                            variant="success"
                            className="max-w-full truncate text-xs"
                          >
                            {t('availableShort', { count: summary.available })}
                          </DataTableBadge>
                          {summary.occupied > 0 ? (
                            <DataTableBadge
                              variant="warning"
                              className="max-w-full truncate text-xs"
                            >
                              {t('occupiedShort', { count: summary.occupied })}
                            </DataTableBadge>
                          ) : null}
                          {summary.unavailable > 0 ? (
                            <span className="truncate text-xs text-atg-muted">
                              {t('unavailableShort', { count: summary.unavailable })}
                            </span>
                          ) : null}
                        </div>
                      </>
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
        destinationId={destinationFilter || undefined}
        organizationId={organizationFilter || undefined}
        canWrite={canWrite}
        onUpdated={() => void load()}
      />
    </div>
  );
}
