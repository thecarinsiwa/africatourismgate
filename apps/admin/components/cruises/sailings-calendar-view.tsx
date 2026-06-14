'use client';

import { Button, Card } from '@africatourismgate/ui';
import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CALENDAR_WEEKDAY_HEADERS,
  currentYearMonth,
  enumerateMonthDays,
  formatMonthLabel,
  parseYearMonth,
  shiftYearMonth,
  weekdayOffset,
} from '../../lib/availability-dates';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

type SailingsCalendarViewProps = {
  itineraryById: Map<string, Itinerary>;
  shipById: Map<string, Ship>;
};

export function SailingsCalendarView({
  itineraryById,
  shipById,
}: SailingsCalendarViewProps) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; sailings: CruiseSailing[] }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruiseSailings({ page: 1, limit: 300 });
      setState({ status: 'ready', sailings: result.data });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { year, month } = parseYearMonth(yearMonth);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const sailingsByDate = useMemo(() => {
    const map = new Map<string, CruiseSailing[]>();
    if (state.status !== 'ready') return map;

    for (const sailing of state.sailings) {
      const dateKey = sailing.departureDate.slice(0, 10);
      if (!dateKey.startsWith(monthPrefix)) continue;
      const list = map.get(dateKey) ?? [];
      list.push(sailing);
      map.set(dateKey, list);
    }
    return map;
  }, [monthPrefix, state]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Mois précédent"
            onClick={() => setYearMonth(shiftYearMonth(yearMonth, -1))}
          >
            ‹
          </Button>
          <h3
            className="min-w-[10rem] text-center text-sm font-semibold text-atg-fg"
            aria-live="polite"
          >
            {formatMonthLabel(yearMonth)}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Mois suivant"
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
          Aujourd’hui
        </Button>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="md">
          {state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">Chargement…</p>
          ) : (
            <div
              role="grid"
              aria-label={`Calendrier des départs — ${formatMonthLabel(yearMonth)}`}
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
                const daySailings = sailingsByDate.get(cell.date) ?? [];

                return (
                  <div
                    key={cell.date}
                    role="gridcell"
                    className="flex min-h-[5rem] flex-col rounded-lg border border-atg-border/60 bg-atg-elevated p-1.5 sm:min-h-[6rem] sm:p-2"
                  >
                    <span className="text-xs font-semibold tabular-nums text-atg-fg">
                      {dayNum}
                    </span>
                    <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                      {daySailings.map((sailing) => {
                        const itinerary = itineraryById.get(sailing.itineraryId);
                        const ship = itinerary ? shipById.get(itinerary.shipId) : undefined;
                        const label = itinerary?.name ?? ship?.name ?? 'Départ';

                        return (
                          <Link
                            key={sailing.id}
                            href={`/produits/croisieres/${sailing.id}`}
                            className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 sm:text-xs"
                            title={ship ? `${label} — ${ship.name}` : label}
                          >
                            {label}
                          </Link>
                        );
                      })}
                    </div>
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
