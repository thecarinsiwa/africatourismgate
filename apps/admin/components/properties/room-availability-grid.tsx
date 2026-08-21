'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, useToast } from '@africatourismgate/ui';
import type { RoomAvailability } from '@africatourismgate/types';
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

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type DayDraft = {
  availableUnits: string;
  priceCents: string;
};

type RoomAvailabilityGridProps = {
  roomId: string;
  currency: string;
  defaultPriceCents: number;
  yearMonth: string;
  onYearMonthChange: (yearMonth: string) => void;
  onRowsChange?: (rows: RoomAvailability[]) => void;
  pendingEditDate?: string | null;
  onPendingEditHandled?: () => void;
};

type OccupancyTone = 'danger' | 'warning' | 'success' | 'neutral';

function occupancyTone(units: number): OccupancyTone {
  if (units === 0) return 'danger';
  if (units <= 2) return 'warning';
  if (units > 2) return 'success';
  return 'neutral';
}

const toneClasses: Record<OccupancyTone, string> = {
  danger: 'bg-atg-danger-light text-atg-danger-fg ring-atg-danger/30',
  warning: 'bg-atg-warning-light text-atg-warning-fg ring-atg-warning/30',
  success: 'bg-atg-success-light text-atg-success-fg ring-atg-success/30',
  neutral: 'bg-atg-surface text-atg-muted ring-atg-border/60',
};

export function RoomAvailabilityGrid({
  roomId,
  currency,
  defaultPriceCents,
  yearMonth,
  onYearMonthChange,
  onRowsChange,
  pendingEditDate,
  onPendingEditHandled,
}: RoomAvailabilityGridProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const tCalendar = useTranslations('modules.common.availabilityCalendar');
  const tForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tToast = useTranslations('modules.common.toast');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Map<string, RoomAvailability>>(new Map());
  const [drafts, setDrafts] = useState<Map<string, DayDraft>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);

  const monthDays = useMemo(() => enumerateMonthDays(yearMonth), [yearMonth]);
  const leadingBlanks = useMemo(() => weekdayOffset(yearMonth), [yearMonth]);

  const weekdayHeaders = useMemo(
    () => WEEKDAY_KEYS.map((key) => tCalendar(`weekdays.${key}`)),
    [tCalendar],
  );

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
      const result = await getApiClient().listRoomAvailability({
        roomId,
        dateFrom,
        dateTo,
        page: 1,
        limit: 100,
      });
      const map = new Map<string, RoomAvailability>();
      for (const row of result.data) {
        map.set(row.date.slice(0, 10), row);
      }
      setRows(map);
      onRowsChange?.(
        [...map.values()].sort((a, b) => a.date.localeCompare(b.date)),
      );
      const nextDrafts = new Map<string, DayDraft>();
      for (const date of monthDays) {
        const existing = map.get(date);
        nextDrafts.set(date, {
          availableUnits: String(existing?.availableUnits ?? 0),
          priceCents: String(existing?.priceCents ?? defaultPriceCents),
        });
      }
      setDrafts(nextDrafts);
      setFocusedDate((prev) =>
        prev && monthDays.includes(prev) ? prev : monthDays[0] ?? null,
      );
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
      onRowsChange?.([]);
    } finally {
      setLoading(false);
    }
  }, [roomId, monthDays, defaultPriceCents, getHebergementsErrorMessage, onRowsChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setEditingDate(null);
  }, [yearMonth, roomId]);

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
        availableUnits: '0',
        priceCents: String(defaultPriceCents),
      };
      next.set(date, { ...current, [field]: value });
      return next;
    });
  }

  async function handleSaveDay(date: string) {
    const draft = drafts.get(date);
    if (!draft) return;

    const units = Number(draft.availableUnits);
    const cents = Number(draft.priceCents);
    if (!Number.isFinite(units) || units < 0) {
      setError(tValidation('invalidStock'));
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setError(tValidation('invalidPriceCents'));
      return;
    }

    setSavingDate(date);
    setError(null);
    try {
      const client = getApiClient();
      const existing = rows.get(date);
      if (existing) {
        await client.updateRoomAvailability(existing.id, {
          availableUnits: units,
          priceCents: cents,
        });
      } else {
        await client.createRoomAvailability({
          roomId,
          date,
          availableUnits: units,
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
      const message = getHebergementsErrorMessage(err);
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
      await getApiClient().deleteRoomAvailability(existing.id);
      toast({
        title: tToast('availabilityDeleted'),
        message: formatDateLabel(date),
        variant: 'success',
      });
      setEditingDate(null);
      await load();
    } catch (err) {
      const message = getHebergementsErrorMessage(err);
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
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-start">
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
          className="w-full sm:w-auto"
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

      <Card variant="dashboard" padding="md" className="min-w-0 overflow-hidden">
        {loading ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : (
          <>
            <ul className="divide-y divide-atg-border md:hidden">
              {monthDays.map((date) => {
                const existing = rows.get(date);
                const draft = drafts.get(date);
                const units = Number(draft?.availableUnits ?? 0);
                const cents = Number(draft?.priceCents ?? defaultPriceCents);
                const tone = occupancyTone(Number.isFinite(units) ? units : 0);
                const isEditing = editingDate === date;

                return (
                  <li key={date} className="py-3">
                    {isEditing ? (
                      <div className="space-y-3 rounded-lg border border-primary/40 bg-atg-elevated p-3">
                        <p className="text-sm font-medium text-atg-fg">{formatShortDay(date)}</p>
                        <Input
                          type="number"
                          min={0}
                          label={tCalendar('stockUnits')}
                          value={draft?.availableUnits ?? '0'}
                          onChange={(e) => updateDraft(date, 'availableUnits', e.target.value)}
                        />
                        <Input
                          type="number"
                          min={0}
                          label={tForm('priceCentsShort')}
                          value={draft?.priceCents ?? String(defaultPriceCents)}
                          onChange={(e) => updateDraft(date, 'priceCents', e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            loading={savingDate === date}
                            onClick={() => void handleSaveDay(date)}
                          >
                            {tActions('confirm')}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={closeEdit}>
                            {tActions('cancel')}
                          </Button>
                          {existing ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="!text-red-600"
                              loading={deletingId === existing.id}
                              onClick={() => void handleDelete(date)}
                            >
                              {tActions('delete')}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left ring-1 ring-inset ${toneClasses[tone]}`}
                        onClick={() => openEdit(date)}
                      >
                        <span className="text-sm font-medium">{formatShortDay(date)}</span>
                        <span className="text-right text-sm tabular-nums">
                          <span className="block">
                            {Number.isFinite(units)
                              ? tCalendar('unitsShort', { count: units })
                              : '—'}
                          </span>
                          <span className="block text-xs opacity-90">
                            {Number.isFinite(cents) ? formatPrice(cents, currency) : '—'}
                          </span>
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <div
                ref={gridRef}
                role="grid"
                aria-label={monthLabel}
                className="grid min-w-[42rem] grid-cols-7 gap-1 lg:gap-2"
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
              const units = Number(draft?.availableUnits ?? 0);
              const cents = Number(draft?.priceCents ?? defaultPriceCents);
              const tone = occupancyTone(Number.isFinite(units) ? units : 0);
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
                        value={draft?.availableUnits ?? '0'}
                        onChange={(e) => updateDraft(date, 'availableUnits', e.target.value)}
                        className="!px-2 !py-1 text-xs"
                        aria-label={`${tCalendar('stockUnits')} ${date}`}
                      />
                      <Input
                        type="number"
                        min={0}
                        value={draft?.priceCents ?? String(defaultPriceCents)}
                        onChange={(e) => updateDraft(date, 'priceCents', e.target.value)}
                        className="!px-2 !py-1 text-xs"
                        aria-label={`${tForm('priceCentsShort')} ${date}`}
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
                        {Number.isFinite(units)
                          ? tCalendar('unitsShort', { count: units })
                          : '—'}
                      </span>
                      <span className="text-[10px] tabular-nums opacity-90 sm:text-xs">
                        {Number.isFinite(cents)
                          ? formatPrice(cents, currency)
                          : '—'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
