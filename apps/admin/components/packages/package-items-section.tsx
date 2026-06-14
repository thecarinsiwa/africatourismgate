'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  PackageDetail,
  PackageItemEnriched,
  PackageItemType,
} from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { getPackagesErrorMessage } from '../../lib/packages-errors';
import { PackagePricingRecap } from './package-pricing-recap';

const ITEM_TYPE_LABELS: Record<PackageItemType, string> = {
  property: 'Hébergement',
  flight: 'Vol',
  vehicle: 'Véhicule',
  cruise: 'Cabine (croisière)',
  activity: 'Activité',
};

type CatalogOption = { id: string; label: string };

type PackageItemsSectionProps = {
  packageId: string;
};

export function PackageItemsSection({ packageId }: PackageItemsSectionProps) {
  const typeId = useId();
  const itemId = useId();
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [itemType, setItemType] = useState<PackageItemType>('property');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [catalog, setCatalog] = useState<CatalogOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getPackage(packageId);
      setDetail(data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getPackagesErrorMessage(error) });
    }
  }, [packageId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setSelectedItemId('');
    const client = getApiClient();

    const loadCatalog = async () => {
      try {
        let options: CatalogOption[] = [];
        switch (itemType) {
          case 'property': {
            const r = await client.listProperties({ page: 1, limit: 100 });
            options = r.data.map((p) => ({ id: p.id, label: p.name }));
            break;
          }
          case 'flight': {
            const r = await client.listFlights({ page: 1, limit: 100 });
            options = r.data.map((f) => ({
              id: f.id,
              label: `Vol ${f.flightNumber}`,
            }));
            break;
          }
          case 'vehicle': {
            const r = await client.listVehicles({ page: 1, limit: 100 });
            options = r.data.map((v) => ({
              id: v.id,
              label: v.licensePlate ?? v.id.slice(0, 8),
            }));
            break;
          }
          case 'cruise': {
            const r = await client.listCabins({ page: 1, limit: 100 });
            options = r.data.map((c) => ({ id: c.id, label: c.categoryName }));
            break;
          }
          case 'activity': {
            const r = await client.listActivities({ page: 1, limit: 100 });
            options = r.data.map((a) => ({ id: a.id, label: a.title }));
            break;
          }
        }
        if (!cancelled) setCatalog(options);
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [itemType]);

  function resetForm() {
    setShowForm(false);
    setSelectedItemId('');
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!selectedItemId) {
      setFormError('Sélectionnez un produit.');
      return;
    }
    setSubmitting(true);
    try {
      await getApiClient().createPackageItem({
        packageId,
        itemType,
        itemId: selectedItemId,
      });
      resetForm();
      await load();
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = useCallback(
    async (item: PackageItemEnriched) => {
      if (!window.confirm(`Retirer « ${item.label} » du forfait ?`)) return;
      setDeletingId(item.id);
      try {
        await getApiClient().deletePackageItem(item.id);
        await load();
      } catch (error) {
        setFormError(getPackagesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<PackageItemEnriched, unknown>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => ITEM_TYPE_LABELS[row.original.itemType],
      },
      { accessorKey: 'label', header: 'Produit' },
      {
        id: 'price',
        header: 'Prix unitaire',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatMoney(row.original.unitPriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="remove"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  const items = detail?.items ?? [];
  const pricing = detail?.pricing;
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Items du forfait</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Produits combinés (hébergement, vol, activité, etc.).
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            Ajouter un item
          </Button>
        ) : null}
      </div>

      {pricing ? (
        <PackagePricingRecap pricing={pricing} itemCount={items.length} />
      ) : null}

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">Nouvel item</h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <div>
              <label htmlFor={typeId} className="mb-2 block text-sm font-medium">
                Type
              </label>
              <select
                id={typeId}
                className={selectClass}
                value={itemType}
                onChange={(e) => setItemType(e.target.value as PackageItemType)}
              >
                {(Object.keys(ITEM_TYPE_LABELS) as PackageItemType[]).map((t) => (
                  <option key={t} value={t}>
                    {ITEM_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={itemId} className="mb-2 block text-sm font-medium">
                Produit
              </label>
              <select
                id={itemId}
                className={selectClass}
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={catalogLoading}
              >
                <option value="">
                  {catalogLoading ? 'Chargement…' : '— Choisir —'}
                </option>
                {catalog.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                Ajouter
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none">
          <DataTable
            columns={columns}
            data={items}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucun item dans ce forfait."
            getRowId={(r) => r.id}
          />
        </Card>
      )}
    </section>
  );
}
