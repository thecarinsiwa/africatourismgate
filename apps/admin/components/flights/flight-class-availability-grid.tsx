'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, useToast } from '@africatourismgate/ui';
import type { FlightClassAvailability } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  currentYearMonth,
  enumerateMonthDays,
  formatDateLabel,
  formatPrice,
  parseYearMonth,
  shiftYearMonth,
  weekdayOffset,
} from '../../lib/availability-dates';

type DayDraft = {
  availableSeats: string;
  priceCents: string;
};

type FlightClassAvailabilityGridProps = {
  flightClassId: string;
  defaultPriceCents: number;
  yearMonth: string;
  onYearMonthChange: (yearMonth: string) => void;
  onRowsChange?: (rows: FlightClassAvailability[]) => void;
  pendingEditDate?: string | null;
  onPendingEditHandled?: () => void;
};

type OccupancyTone = 'danger' | 'warning' | 'success' | 'neutral';

function occupancyTone(seats: number): OccupancyTone {
  if (seats === 0) return 'danger';
  if (seats <= 2) return 'warning';
  if (seats > 2) return 'success';
  return 'neutral';
}

const toneClasses: Record<OccupancyTone, string> = {
  danger: 'bg-atg-danger-light text-atg-danger-fg ring-atg-danger/30',
  warning: 'bg-atg-warning-light text-atg-warning-fg ring-atg-warning/30',
  success: 'bg-atg-success-light text-atg-success-fg ring-atg-success/30',
  neutral: 'bg-atg-surface text-atg-muted ring-atg-border/60',
};

export function FlightClassAvailabilityGrid({
  flightClassId,
  defaultPriceCents,
  yearMonth,
  onYearMonthChange,
  onRowsChange,
  pendingEditDate,
  onPendingEditHandled,
}: FlightClassAvailabilityGridProps) {
  const locale = useLocale();
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const tCalendar = useTranslations('modules.common.availabilityCalendar');
  const tCommon = useTranslations('modules.common');
  const tToast = useTranslations('modules.common.toast');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Map<string, FlightClassAvailability>>(new Map());
  const [drafts, setDrafts] = useState<Map<string, DayDraft>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);

  const weekdayHeaders = useMemo(
    () => [
      tCalendar('weekdays.mon'),
      tCalendar('weekdays.tue'),
      tCalendar('weekdays.wed'),
      tCalendar('weekdays.thu'),
      tCalendar('weekdays.fri'),
      tCalendar('weekdays.sat'),
      tCalendar('weekdays.sun'),
    ],
    [tCalendar],
  );

  const monthDays = useMemo(() => enumerateMonthDays(yearMonth), [yearMonth]);
  const leadingBlanks = useMemo(() => weekdayOffset(yearMonth), [yearMonth]);

  const formatMonthLabel = useCallback(
    (isoMonth: string): string => {
      const { year, month } = parseYearMonth(isoMonth);
      return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      });
    },
    [locale],
  );

  const formatShortDay = useCallback(
    (isoDate: string): string => {
      const [, , dayStr] = isoDate.split('-');
      const day = Number(dayStr);
      const date = new Date(isoDate + 'T12:00:00');
      const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
      return `${weekday} ${day}`;
    },
    [locale],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateFrom = monthDays[0];
      const dateTo = monthDays[monthDays.length - 1];
      const result = await getApiClient().listFlightClassAvailability({
        flightClassId,
        dateFrom,
        dateTo,
        page: 1,
        limit: 100,
      });
      const map = new Map<string, FlightClassAvailability>();
      for (const row of result.data) {
        map.set(row.date.slice(0, 10), row);
      }
      setRows(map);
      onRowsChange?.(
        Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)),
      );
      const nextDrafts = new Map<string, DayDraft>();
      for (const date of monthDays) {
        const existing = map.get(date);
        nextDrafts.set(date, {
          availableSeats: String(existing?.availableSeats ?? 0),
          priceCents: String(existing?.priceCents ?? defaultPriceCents),
        });
      }
      setDrafts(nextDrafts);
      setFocusedDate((prev) =>
        prev && monthDays.includes(prev) ? prev : monthDays[0] ?? null,
      );
    } catch (err) {
      setError(getVolsErrorMessage(err));
      onRowsChange?.([]);
    } finally {
      setLoading(false);
    }
  }, [flightClassId, monthDays, defaultPriceCents, getVolsErrorMessage, onRowsChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setEditingDate(null);
  }, [yearMonth, flightClassId]);

  useEffect(() => {
    if (!pendingEditDate) return;
    if (!monthDays.includes(pendingEditDate)) return;
    setEditingDate(pendingEditDate);
    setFocusedDate(pendingEditDate);
    onPendingEditHandled?.();
  }, [pendingEditDate, monthDays, onPendingEditHandled]);

  function updateDraft(date: string, field: keyof DayDraft, value: string) {
    setDrafts((prev) => {
      const next = new Map(prev);
      const current = next.get(date) ?? {
        availableSeats: '0',
        priceCents: String(defaultPriceCents),
      };
      next.set(date, { ...current, [field]: value });
      return next;
    });
  }

  async function handleSaveDay(date: string) {
    const draft = drafts.get(date);
    if (!draft) return;

    const seats = Number(draft.availableSeats);
    const cents = Number(draft.priceCents);
    if (!Number.isFinite(seats) || seats < 0) {
      setError(tCommon('validation.invalidSeatsShort'));
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setError(tCommon('validation.invalidPriceCents'));
      return;
    }

    setSavingDate(date);
    setError(null);
    try {
      const client = getApiClient();
      const existing = rows.get(date);
      if (existing) {
        await client.updateFlightClassAvailability(existing.id, {
          availableSeats: seats,
          priceCents: cents,
        });
      } else {
        await client.createFlightClassAvailability({
          flightClassId,
          date,
          availableSeats: seats,
          priceCents: cents,
        });
      }
      toast({
        title: tToast('availabilitySaved'),
        message: formatDateLabel(date),
        variant: 'success',
      });
      setEditingDate(null);
      await load();
    } catch (err) {
      const message = getVolsErrorMessage(err);
      setError(message);
      toast({
        title: tToast('saveError'),
        message,
        variant: 'error',
      });
    } finally {
      setSavingDate(null);
    }
  }

  async function handleDelete(date: string) {
    const existing = rows.get(date);
    if (!existing) return;

    setDeletingId(existing.id);
    setError(null);
    try {
      await getApiClient().deleteFlightClassAvailability(existing.id);
      toast({
        title: tToast('availabilityDeleted'),
        message: formatDateLabel(date),
        variant: 'success',
      });
      setEditingDate(null);
      await load();
    } catch (err) {
      const message = getVolsErrorMessage(err);
      setError(message);
      toast({
        title: tToast('deleteError'),
        message,
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }

  function openEdit(date: string) {
    setEditingDate(date);
    setFocusedDate(date);
  }

  function closeEdit() {
    setEditingDate(null);
  }

  function moveFocus(delta: number) {
    if (!focusedDate) return;
    const index = monthDays.indexOf(focusedDate);
    if (index < 0) return;
    const next = monthDays[index + delta];
    if (next) setFocusedDate(next);
  }

  function handleGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!focusedDate) return;

    if (editingDate) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeEdit();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-7);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(7);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        openEdit(focusedDate);
        break;
      default:
        break;
    }
  }

  const calendarCells = useMemo(() => {
    const cells: Array<{ type: 'blank' } | { type: 'day'; date: string }> = [];
    for (let i = 0; i < leadingBlanks; i += 1) {
      cells.push({ type: 'blank' });
    }
    for (const date of monthDays) {
      cells.push({ type: 'day', date });
    }
    return cells;
  }, [leadingBlanks, monthDays]);

  const monthLabel = formatMonthLabel(yearMonth);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={tCalendar('previousMonth')}
            onClick={() => onYearMonthChange(shiftYearMonth(yearMonth, -1))}
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
            onClick={() => onYearMonthChange(shiftYearMonth(yearMonth, 1))}
          >
            ›
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onYearMonthChange(currentYearMonth())}
        >
          {tCalendar('today')}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <Card variant="dashboard" padding="md">
        {loading ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : (
          <div
            ref={gridRef}
            role="grid"
            aria-label={monthLabel}
            className="grid grid-cols-7 gap-1 sm:gap-2"
            onKeyDown={handleGridKeyDown}
          >
            {weekdayHeaders.map((label) => (
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
                    className="min-h-[4.5rem] rounded-lg sm:min-h-[5.5rem]"
                  />
                );
              }

              const { date } = cell;
              const existing = rows.get(date);
              const draft = drafts.get(date);
              const seats = Number(draft?.availableSeats ?? 0);
              const cents = Number(draft?.priceCents ?? defaultPriceCents);
              const tone = occupancyTone(Number.isFinite(seats) ? seats : 0);
              const isEditing = editingDate === date;
              const isFocused = focusedDate === date;
              const dayNum = Number(date.split('-')[2]);

              return (
                <div
                  key={date}
                  role="gridcell"
                  tabIndex={isFocused ? 0 : -1}
                  aria-label={formatShortDay(date)}
                  aria-selected={isFocused}
                  className="min-h-[4.5rem] rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[5.5rem]"
                  onFocus={() => setFocusedDate(date)}
                  onClick={() => {
                    setFocusedDate(date);
                    if (!isEditing) openEdit(date);
                  }}
                >
                  {isEditing ? (
                    <div className="flex h-full flex-col gap-1 rounded-lg border border-primary/40 bg-atg-elevated p-2">
                      <span className="text-xs font-medium text-atg-fg">{dayNum}</span>
                      <Input
                        type="number"
                        min={0}
                        value={draft?.availableSeats ?? '0'}
                        onChange={(e) => updateDraft(date, 'availableSeats', e.target.value)}
                        className="!px-2 !py-1 text-xs"
                        aria-label={tCalendar('seatsAria', { date })}
                      />
                      <Input
                        type="number"
                        min={0}
                        value={draft?.priceCents ?? String(defaultPriceCents)}
                        onChange={(e) => updateDraft(date, 'priceCents', e.target.value)}
                        className="!px-2 !py-1 text-xs"
                        aria-label={tCalendar('priceAria', { date })}
                      />
                      <div className="mt-auto flex flex-wrap gap-1">
                        <Button
                          type="button"
                          size="sm"
                          className="!px-2 !py-0.5 text-xs"
                          loading={savingDate === date}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSaveDay(date);
                          }}
                        >
                          {tActions('confirm')}
                        </Button>
                        {existing ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="!px-2 !py-0.5 text-xs !text-red-600"
                            loading={deletingId === existing.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete(date);
                            }}
                          >
                            ×
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex h-full flex-col rounded-lg p-2 ring-1 ring-inset ${toneClasses[tone]} cursor-pointer transition-opacity hover:opacity-90`}
                    >
                      <span className="text-xs font-semibold">{dayNum}</span>
                      <span className="mt-1 text-xs tabular-nums">
                        {Number.isFinite(seats)
                          ? tCalendar('seatsShort', { count: seats })
                          : emptyDash}
                      </span>
                      <span className="text-[10px] tabular-nums opacity-90 sm:text-xs">
                        {Number.isFinite(cents) ? formatPrice(cents, 'USD') : emptyDash}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
