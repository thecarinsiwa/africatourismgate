'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  cn,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  PackageDetail,
  PackageItemEnriched,
  PackageItemType,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { usePackageItemTypeOptions } from '../../lib/i18n/use-module-labels';
import { PackageCompositionBanner } from './package-composition-banner';
import { PackageItemTypeIcon } from './package-item-type-icon';
import { PackagePreviewCard } from './package-preview-card';
import { PackagePricingRecap } from './package-pricing-recap';

type CatalogOption = { id: string; label: string };

type PackageItemsSectionProps = {
  packageId: string;
  embedded?: boolean;
  onChanged?: () => void;
};

export function PackageItemsSection({
  packageId,
  embedded = false,
  onChanged,
}: PackageItemsSectionProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.packages.sections.items');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const itemTypeOptions = usePackageItemTypeOptions();
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
  const [confirmTarget, setConfirmTarget] = useState<PackageItemEnriched | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getPackage(packageId);
      setDetail(data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getPackagesErrorMessage(error) });
    }
  }, [packageId, getPackagesErrorMessage]);

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
              label: t('flightLabel', { flightNumber: f.flightNumber }),
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
  }, [itemType, t]);

  function resetForm() {
    setShowForm(false);
    setSelectedItemId('');
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!selectedItemId) {
      setFormError(tCommon('validation.selectProduct'));
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
      onChanged?.();
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((item: PackageItemEnriched) => {
    setConfirmTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const item = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(item.id);
    try {
      await getApiClient().deletePackageItem(item.id);
      await load();
      onChanged?.();
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getPackagesErrorMessage, load, onChanged]);

  const columns = useMemo<ColumnDef<PackageItemEnriched, unknown>[]>(
    () => [
      {
        id: 'type',
        header: tCommon('columns.type'),
        cell: ({ row }) => (
          <PackageItemTypeIcon itemType={row.original.itemType} showLabel size="sm" />
        ),
      },
      {
        accessorKey: 'label',
        header: tCommon('columns.product'),
      },
      {
        id: 'price',
        header: tCommon('columns.unitPrice'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatMoney(row.original.unitPriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="remove"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDeleteRequest, tCommon],
  );

  const items = detail?.items ?? [];
  const pricing = detail?.pricing;
  const pkg = detail?.package;
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('removeTitle')}
        description={confirmTarget ? t('removeConfirm', { label: confirmTarget.label }) : ''}
        confirmLabel={t('removeConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={t('newItem')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <div>
            <label htmlFor={typeId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tCommon('columns.type')}
            </label>
            <div className="flex items-center gap-3">
              <PackageItemTypeIcon itemType={itemType} size="md" />
              <select
                id={typeId}
                className={cn(selectClass, 'min-w-0 flex-1')}
                value={itemType}
                onChange={(e) => setItemType(e.target.value as PackageItemType)}
                disabled={submitting}
              >
                {itemTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={itemId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tCommon('columns.product')}
            </label>
            <select
              id={itemId}
              className={selectClass}
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              disabled={catalogLoading || submitting}
            >
              <option value="">
                {catalogLoading ? tCommon('loading') : tCommon('select.chooseDash')}
              </option>
              {catalog.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={submitting}>
              {tActions('create')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <section
        className={cn('space-y-6', embedded ? '' : 'mt-12 border-t border-atg-border pt-10')}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {!embedded ? (
              <>
                <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
                <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
              </>
            ) : (
              <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
            )}
          </div>
          <Button type="button" onClick={() => setShowForm(true)}>
            {t('addItem')}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="min-w-0 space-y-4 self-start">
            <PackageCompositionBanner items={items} />

            {state.status === 'error' ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {state.message}
              </p>
            ) : (
              <Card variant="dashboard" padding="none" className="h-fit overflow-hidden">
                <DataTable
                  columns={columns}
                  data={items}
                  isLoading={state.status === 'loading'}
                  emptyMessage={t('empty')}
                  getRowId={(r) => r.id}
                />
              </Card>
            )}
          </div>

          <aside className="min-w-0 space-y-3 self-start lg:sticky lg:top-6">
            {detail && pricing && pkg ? (
              <>
                <PackagePricingRecap
                  pricing={pricing}
                  itemCount={items.length}
                  size="sm"
                  className="max-w-none"
                />
                <PackagePreviewCard
                  pkg={pkg}
                  itemCount={items.length}
                  pricing={pricing}
                  size="sm"
                />
              </>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
