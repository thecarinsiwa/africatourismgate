'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { RentalAgency, Vehicle, VehicleCategory } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getVehicleCategoryIcon } from '../../lib/vehicle-category-icon-map';
import { VehicleThumbnail } from './vehicle-thumbnail';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function VehiclesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.list');
  const tFilters = useTranslations('modules.locations.filters');
  const tColumns = useTranslations('modules.locations.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tCommon = useTranslations('modules.common');
  const agencyFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [agencies, setAgencies] = useState<RentalAgency[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; vehicles: Vehicle[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const emptyDash = tCommon('empty.dash');

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listRentalAgencies({ page: 1, limit: 100 }),
      client.listVehicleCategories({ page: 1, limit: 100 }),
    ])
      .then(([a, c]) => {
        setAgencies(a.data);
        setCategories(c.data);
      })
      .catch(() => {
        setAgencies([]);
        setCategories([]);
      });
  }, []);

  const agencyById = useMemo(
    () => new Map(agencies.map((a) => [a.id, a.name])),
    [agencies],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listVehicles({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        agencyId: agencyFilter || undefined,
      });
      setState({
        status: 'ready',
        vehicles: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [page, search, agencyFilter, getLocationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = useCallback(
    async (vehicle: Vehicle) => {
      const label = vehicle.licensePlate ?? vehicle.id.slice(0, 8);
      if (!window.confirm(t('deleteConfirm', { label }))) return;
      setDeleteError(null);
      setDeletingId(vehicle.id);
      try {
        await getApiClient().deleteVehicle(vehicle.id);
        await load();
      } catch (error) {
        setDeleteError(getLocationsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load, t, getLocationsErrorMessage],
  );

  const columns = useMemo<ColumnDef<Vehicle, unknown>[]>(
    () => [
      {
        id: 'thumbnail',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const categoryName = categoryById.get(row.original.categoryId);
          return (
            <VehicleThumbnail
              vehicleId={row.original.id}
              label={row.original.licensePlate ?? categoryName ?? t('fallbackLabel')}
              categoryName={categoryName}
              size="md"
            />
          );
        },
      },
      {
        accessorKey: 'licensePlate',
        header: tColumns('licensePlate'),
        cell: ({ row }) => (
          <code className="font-mono text-sm">
            {row.original.licensePlate ?? emptyDash}
          </code>
        ),
      },
      {
        id: 'agency',
        header: tColumns('agency'),
        cell: ({ row }) => agencyById.get(row.original.agencyId) ?? emptyDash,
      },
      {
        id: 'category',
        header: tColumns('category'),
        cell: ({ row }) => {
          const categoryName = categoryById.get(row.original.categoryId);
          if (!categoryName) return emptyDash;
          return (
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-atg-surface text-primary ring-1 ring-atg-border/60">
                {getVehicleCategoryIcon(categoryName, 'h-4 w-4')}
              </span>
              {categoryName}
            </span>
          );
        },
      },
      {
        id: 'price',
        header: tColumns('pricePerDay'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.dailyPriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="edit" href={`/produits/locations/${row.original.id}`} />
            <DataTableActionButton
              action="delete"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      agencyById,
      categoryById,
      deletingId,
      emptyDash,
      handleDelete,
      t,
      tColumns,
      tCommonColumns,
    ],
  );

  const vehicles = state.status === 'ready' ? state.vehicles : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-xs">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor={agencyFilterId} className="mb-2 block text-sm font-medium">
              {tFilters('agency')}
            </label>
            <select
              id={agencyFilterId}
              className={selectClass}
              value={agencyFilter}
              onChange={(e) => {
                setAgencyFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{tFilters('allAgencies')}</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button href="/produits/locations/nouveau">{t('newVehicle')}</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600">
          {deleteError}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={vehicles}
              isLoading={state.status === 'loading'}
              emptyMessage={
                agencyFilter || search ? t('emptyFiltered') : t('emptyDefault')
              }
              emptyVariant={search || agencyFilter ? 'search' : 'default'}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('vehicle')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
