'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import type { FlightClassAvailability } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  enumerateMonthDays,
  formatDateLabel,
  formatMonthLabel,
  formatPrice,
  shiftYearMonth,
} from '../../lib/availability-dates';
import { getVolsErrorMessage } from '../../lib/vols-errors';

type DayDraft = {
  availableSeats: string;
  priceCents: string;
};

type FlightClassAvailabilityGridProps = {
  flightClassId: string;
  defaultPriceCents: number;
  yearMonth: string;
  onYearMonthChange: (yearMonth: string) => void;
};

export function FlightClassAvailabilityGrid({
  flightClassId,
  defaultPriceCents,
  yearMonth,
  onYearMonthChange,
}: FlightClassAvailabilityGridProps) {
  const [rows, setRows] = useState<Map<string, FlightClassAvailability>>(new Map());
  const [drafts, setDrafts] = useState<Map<string, DayDraft>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const monthDays = useMemo(() => enumerateMonthDays(yearMonth), [yearMonth]);

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
      const nextDrafts = new Map<string, DayDraft>();
      for (const date of monthDays) {
        const existing = map.get(date);
        nextDrafts.set(date, {
          availableSeats: String(existing?.availableSeats ?? 0),
          priceCents: String(existing?.priceCents ?? defaultPriceCents),
        });
      }
      setDrafts(nextDrafts);
    } catch (err) {
      setError(getVolsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [flightClassId, monthDays, defaultPriceCents]);

  useEffect(() => {
    void load();
  }, [load]);

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
      setError('Sièges invalides.');
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setError('Prix invalide (centimes).');
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
      await load();
    } catch (err) {
      setError(getVolsErrorMessage(err));
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
      await load();
    } catch (err) {
      setError(getVolsErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-atg-fg">{formatMonthLabel(yearMonth)}</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onYearMonthChange(shiftYearMonth(yearMonth, -1))}
          >
            Mois précédent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onYearMonthChange(shiftYearMonth(yearMonth, 1))}
          >
            Mois suivant
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-atg-border text-sm">
          <thead className="bg-atg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-atg-fg">Date</th>
              <th className="px-4 py-3 text-left font-medium text-atg-fg">Sièges</th>
              <th className="px-4 py-3 text-left font-medium text-atg-fg">Prix</th>
              <th className="px-4 py-3 text-right font-medium text-atg-fg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-atg-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-atg-muted">
                  Chargement…
                </td>
              </tr>
            ) : (
              monthDays.map((date) => {
                const existing = rows.get(date);
                const draft = drafts.get(date);
                const hasRow = Boolean(existing);
                return (
                  <tr key={date} className={hasRow ? '' : 'bg-atg-muted/10'}>
                    <td className="px-4 py-3 whitespace-nowrap text-atg-fg">
                      {formatDateLabel(date)}
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={draft?.availableSeats ?? '0'}
                        onChange={(e) =>
                          updateDraft(date, 'availableSeats', e.target.value)
                        }
                        className="max-w-[120px]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={draft?.priceCents ?? String(defaultPriceCents)}
                          onChange={(e) => updateDraft(date, 'priceCents', e.target.value)}
                          className="max-w-[140px]"
                        />
                        {existing ? (
                          <span className="text-xs text-atg-muted">
                            {formatPrice(existing.priceCents, 'USD')}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          loading={savingDate === date}
                          onClick={() => void handleSaveDay(date)}
                        >
                          {hasRow ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                        {hasRow ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            loading={deletingId === existing?.id}
                            className="!text-red-600"
                            onClick={() => void handleDelete(date)}
                          >
                            Supprimer
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
