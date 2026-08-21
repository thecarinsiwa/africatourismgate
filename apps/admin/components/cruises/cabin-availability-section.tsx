'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, DataTable, Input, type ColumnDef } from '@africatourismgate/ui';
import type { Cabin, CabinAvailability, ItineraryPort } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

type RowState = {
  cabin: Cabin;
  availability: CabinAvailability | null;
  availableCount: string;
  priceCents: string;
};

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type CabinAvailabilitySectionProps = {
  sailingId: string;
  shipId: string;
  itineraryId: string;
  /** Sans bordure supérieure — usage dans un onglet. */
  embedded?: boolean;
};

export function CabinAvailabilitySection({
  sailingId,
  shipId,
  itineraryId,
  embedded = false,
}: CabinAvailabilitySectionProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises.sections.cabinAvailability');
  const tColumns = useTranslations('modules.common.columns');
  const tValidation = useTranslations('modules.common.validation');
  const [rows, setRows] = useState<RowState[]>([]);
  const [ports, setPorts] = useState<ItineraryPort[]>([]);
  const [portLabels, setPortLabels] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCabinId, setSavingCabinId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [cabinsRes, availRes, stopsRes, cruisePortsRes] = await Promise.all([
        client.listCabins({ shipId, page: 1, limit: 100 }),
        client.listCabinAvailability({ sailingId, page: 1, limit: 100 }),
        client.listItineraryPorts({ itineraryId, page: 1, limit: 100 }),
        client.listCruisePorts({ page: 1, limit: 100 }),
      ]);

      const availByCabin = new Map(availRes.data.map((a) => [a.cabinId, a]));
      setRows(
        cabinsRes.data.map((cabin) => {
          const availability = availByCabin.get(cabin.id) ?? null;
          return {
            cabin,
            availability,
            availableCount: String(availability?.availableCount ?? 0),
            priceCents: String(availability?.priceCents ?? cabin.basePriceCents),
          };
        }),
      );

      setPorts(stopsRes.data);
      const labels = new Map(
        cruisePortsRes.data.map((p) => [p.id, `${p.code} — ${p.name}`]),
      );
      setPortLabels(labels);
    } catch (err) {
      setError(getCroisieresErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itineraryId, sailingId, shipId, getCroisieresErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveRow = useCallback(
    async (row: RowState) => {
      const count = Number(row.availableCount);
      const cents = Number(row.priceCents);
      if (!Number.isFinite(count) || count < 0) {
        setError(tValidation('invalidCabinCount'));
        return;
      }
      if (!Number.isFinite(cents) || cents < 0) {
        setError(tValidation('invalidPrice'));
        return;
      }

      setSavingCabinId(row.cabin.id);
      setError(null);
      try {
        const client = getApiClient();
        if (row.availability) {
          await client.updateCabinAvailability(row.availability.id, {
            availableCount: count,
            priceCents: cents,
          });
        } else if (count > 0) {
          await client.createCabinAvailability({
            cabinId: row.cabin.id,
            sailingId,
            availableCount: count,
            priceCents: cents,
          });
        }
        await load();
      } catch (err) {
        setError(getCroisieresErrorMessage(err));
      } finally {
        setSavingCabinId(null);
      }
    },
    [getCroisieresErrorMessage, load, sailingId, tValidation],
  );

  function updateDraft(cabinId: string, field: 'availableCount' | 'priceCents', value: string) {
    setRows((prev) =>
      prev.map((r) => (r.cabin.id === cabinId ? { ...r, [field]: value } : r)),
    );
  }

  const stopColumns = useMemo(
    () =>
      [...ports]
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map(
          (stop) =>
            `${stop.dayNumber}. ${portLabels.get(stop.portId) ?? stop.portId}`,
        ),
    [portLabels, ports],
  );

  const columns = useMemo<ColumnDef<RowState, unknown>[]>(
    () => [
      {
        id: 'category',
        header: tColumns('category'),
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.cabin.categoryName}</span>
            <span className="ml-2 text-xs text-atg-muted">
              {t('cabinMeta', {
                maxGuests: row.original.cabin.maxGuests,
                basePrice: formatPrice(
                  row.original.cabin.basePriceCents,
                  row.original.cabin.currency,
                ),
              })}
            </span>
          </div>
        ),
      },
      {
        id: 'available',
        header: tColumns('available'),
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            className="max-w-[6rem]"
            value={row.original.availableCount}
            onChange={(e) =>
              updateDraft(row.original.cabin.id, 'availableCount', e.target.value)
            }
            aria-label={t('cabinsAvailableAria')}
          />
        ),
      },
      {
        id: 'price',
        header: tColumns('price'),
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            className="max-w-[8rem]"
            value={row.original.priceCents}
            onChange={(e) =>
              updateDraft(row.original.cabin.id, 'priceCents', e.target.value)
            }
            aria-label={t('priceCentsAria')}
          />
        ),
      },
      {
        id: 'save',
        header: '',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            onClick={() => void saveRow(row.original)}
            loading={savingCabinId === row.original.cabin.id}
            disabled={savingCabinId !== null && savingCabinId !== row.original.cabin.id}
          >
            {row.original.availability ? t('update') : t('makeBookable')}
          </Button>
        ),
      },
    ],
    [saveRow, savingCabinId, t, tColumns],
  );

  return (
    <section
      className={
        embedded
          ? 'space-y-6'
          : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div>
        {embedded ? null : (
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
        )}
        <p className={embedded ? 'text-sm text-atg-muted' : 'mt-1 text-sm text-atg-muted'}>
          {t('intro')}
        </p>
        {stopColumns.length > 0 ? (
          <p className="mt-3 text-sm text-atg-fg">
            <span className="font-medium text-atg-muted">{t('stopsLabel')}</span>
            {stopColumns.join(' → ')}
          </p>
        ) : (
          <p className="mt-3 text-sm text-amber-700">{t('noStopsWarning')}</p>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={loading}
          emptyMessage={t('empty')}
          getRowId={(r) => r.cabin.id}
        />
      </Card>
    </section>
  );
}
