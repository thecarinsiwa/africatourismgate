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

  const monthLabel = useMemo(() => formatMonthLabel(yearMonth), [yearMonth]);

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
        <Card variant="dashboard" padding="md">
          {state.status === 'loading' ? (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="min-h-[5rem] rounded-lg sm:min-h-[6rem]" />
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
                      className="min-h-[5rem] rounded-lg sm:min-h-[6rem]"
                    />
                  );
                }

                const dayNum = Number(cell.date.split('-')[2]);
                const summary = dayByDate.get(cell.date);
                const isToday = cell.date === new Date().toISOString().slice(0, 10);

                return (
                  <div
                    key={cell.date}
                    role="gridcell"
                    className={cn(
                      'flex min-h-[5rem] flex-col rounded-lg border border-atg-border/60 bg-atg-elevated p-1.5 sm:min-h-[6rem] sm:p-2',
                      isToday && 'ring-2 ring-primary/40',
                    )}
                  >
                    <span className="text-xs font-semibold tabular-nums text-atg-fg">
                      {dayNum}
                    </span>
                    {summary ? (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <DataTableBadge variant="success" className="w-fit text-[10px] sm:text-xs">
                          {t('availableShort', { count: summary.available })}
                        </DataTableBadge>
                        {summary.occupied > 0 ? (
                          <DataTableBadge variant="warning" className="w-fit text-[10px] sm:text-xs">
                            {t('occupiedShort', { count: summary.occupied })}
                          </DataTableBadge>
                        ) : null}
                        {summary.unavailable > 0 ? (
                          <span className="text-[10px] text-atg-muted sm:text-xs">
                            {t('unavailableShort', { count: summary.unavailable })}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
