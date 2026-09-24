'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { RentalAgency, Vehicle, VehicleCategory } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { getVehicleCategoryIcon } from '../../lib/vehicle-category-icon-map';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { VehicleThumbnail } from './vehicle-thumbnail';
import { VehiclesExportDialog } from './vehicles-export-dialog';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type VehiclesViewMode = 'table' | 'grid' | 'compact';

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function getVehicleLabel(
  vehicle: Vehicle,
  categoryById: Map<string, string>,
  fallback: string,
): string {
  return vehicle.licensePlate ?? categoryById.get(vehicle.categoryId) ?? fallback;
}

export function VehiclesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.list');
  const tFilters = useTranslations('modules.locations.filters');
  const tColumns = useTranslations('modules.locations.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tDialogs = useTranslations('modules.locations.dialogs');
  const tExports = useTranslations('modules.locations.exports');
  const tAvailability = useTranslations('modules.locations.sections.availability');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<VehiclesViewMode>('grid');
  const [agencies, setAgencies] = useState<RentalAgency[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; vehicles: Vehicle[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [canExportBookings, setCanExportBookings] = useState(false);

  const emptyDash = tCommon('empty.dash');

  useEffect(() => {
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        setCanExportBookings(
          me.isSuperAdmin || me.permissions.includes('bookings.read'),
        );
      })
      .catch(() => setCanExportBookings(false));
  }, []);

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

  const agencyOptions = useMemo(
    () => [
      { value: '', label: tFilters('allAgencies') },
      ...agencies.map((a) => ({ value: a.id, label: a.name })),
    ],
    [agencies, tFilters],
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: tFilters('allCategories') },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories, tFilters],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listVehicles({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        agencyId: agencyFilter || undefined,
        categoryId: categoryFilter || undefined,
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
  }, [page, search, agencyFilter, categoryFilter, getLocationsErrorMessage]);

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

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const vehicle = pendingDelete;
    const label = getVehicleLabel(vehicle, categoryById, t('fallbackLabel'));
    setDeletingId(vehicle.id);
    try {
      await getApiClient().deleteVehicle(vehicle.id);
      setPendingDelete(null);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedVehicle', { label }),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocationsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [pendingDelete, load, toast, tToast, t, categoryById, getLocationsErrorMessage]);

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
      { value: 'compact' as const, label: t('viewCompact') },
    ],
    [t],
  );

  const renderCategory = useCallback(
    (categoryId: string) => {
      const categoryName = categoryById.get(categoryId);
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
    [categoryById, emptyDash],
  );

  const renderVehicleActions = useCallback(
    (vehicle: Vehicle) => (
      <DataTableActions>
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/produits/locations/${vehicle.id}/voir`}
        />
        <DataTableActionButton
          action="edit"
          label={tActions('edit')}
          href={`/produits/locations/${vehicle.id}`}
        />
        <DataTableActionButton
          action="calendar"
          label={tAvailability('addSlot')}
          href={`/produits/locations/${vehicle.id}/disponibilites?add=1`}
        />
        <DataTableActionButton
          action="delete"
          label={tActions('delete')}
          onClick={() => setPendingDelete(vehicle)}
          disabled={deletingId === vehicle.id}
          loading={deletingId === vehicle.id}
        />
      </DataTableActions>
    ),
    [deletingId, tActions, tAvailability],
  );

  const columns = useMemo<ColumnDef<Vehicle, unknown>[]>(
    () => [
      {
        accessorKey: 'licensePlate',
        header: tColumns('licensePlate'),
        meta: { cellClassName: 'min-w-0' },
        cell: ({ row }) => {
          const categoryName = categoryById.get(row.original.categoryId);
          return (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <VehicleThumbnail
                vehicleId={row.original.id}
                label={getVehicleLabel(row.original, categoryById, t('fallbackLabel'))}
                categoryName={categoryName}
                size="sm"
              />
              <code className="min-w-0 truncate rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs font-semibold text-atg-fg ring-1 ring-atg-border/60 sm:text-sm">
                {row.original.licensePlate ?? emptyDash}
              </code>
            </div>
          );
        },
      },
      {
        id: 'agency',
        header: tColumns('agency'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="block max-w-[12rem] truncate text-sm text-atg-fg">
            {agencyById.get(row.original.agencyId) ?? emptyDash}
          </span>
        ),
      },
      {
        id: 'category',
        header: tColumns('category'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => renderCategory(row.original.categoryId),
      },
      {
        id: 'price',
        header: tColumns('pricePerDay'),
        meta: { align: 'right', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.dailyPriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right', cellClassName: 'w-[8rem] sm:w-auto' },
        cell: ({ row }) => renderVehicleActions(row.original),
      },
    ],
    [
      agencyById,
      categoryById,
      emptyDash,
      renderCategory,
      renderVehicleActions,
      t,
      tColumns,
      tCommonColumns,
    ],
  );

  const vehicles = state.status === 'ready' ? state.vehicles : [];
  const hasActiveFilters = Boolean(search || agencyFilter || categoryFilter);
  const emptyMessage = hasActiveFilters ? t('emptyFiltered') : t('emptyDefault');

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 w-full flex-1 sm:max-w-xs">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={t('searchAria')}
            />
          </div>
          <div className="min-w-0 w-full sm:w-52">
            <Select
              label={tFilters('agency')}
              value={agencyFilter}
              options={agencyOptions}
              onChange={(e) => {
                setAgencyFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="min-w-0 w-full sm:w-52">
            <Select
              label={tFilters('category')}
              value={categoryFilter}
              options={categoryOptions}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <ListViewModeToggle
            value={viewMode}
            options={viewModeOptions}
            onChange={setViewMode}
            ariaLabel={t('viewModeAria')}
            className="w-full sm:w-auto"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="w-full shrink-0 sm:w-auto"
          >
            {tExports('button')}
          </Button>
          <Button
            href="/produits/locations/nouveau"
            className="w-full shrink-0 sm:w-auto lg:hidden"
          >
            {t('newVehicle')}
          </Button>
        </div>
      </div>

      <VehiclesExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        search={search}
        agencyId={agencyFilter}
        categoryId={categoryFilter}
        canExportBookings={canExportBookings}
      />

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          {viewMode === 'table' ? (
            <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
              <DataTable
                columns={columns}
                data={vehicles}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={hasActiveFilters ? 'search' : 'default'}
                expandRowLabel={tDataTable('expandRow')}
                collapseRowLabel={tDataTable('collapseRow')}
                expandRowAriaLabel={tDataTable('expandRowAria')}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
                className="min-w-0"
              />
            </Card>
          ) : state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">{tDataTable('loading')}</p>
          ) : vehicles.length === 0 ? (
            <p className="text-sm text-atg-muted">{emptyMessage}</p>
          ) : viewMode === 'grid' ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {vehicles.map((vehicle) => {
                const categoryName = categoryById.get(vehicle.categoryId);
                const label = getVehicleLabel(vehicle, categoryById, t('fallbackLabel'));
                return (
                  <li key={vehicle.id} className="min-w-0">
                    <Card
                      variant="dashboard"
                      padding="sm"
                      className="flex h-full min-w-0 flex-col gap-3 overflow-hidden"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <VehicleThumbnail
                          vehicleId={vehicle.id}
                          label={label}
                          categoryName={categoryName}
                          size="md"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <code className="inline-block max-w-full truncate rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs font-semibold text-atg-fg ring-1 ring-atg-border/60">
                            {vehicle.licensePlate ?? emptyDash}
                          </code>
                          <p className="truncate text-sm font-medium text-atg-fg">
                            {agencyById.get(vehicle.agencyId) ?? emptyDash}
                          </p>
                          <p className="truncate text-xs text-atg-muted">
                            {categoryName ?? emptyDash}
                          </p>
                        </div>
                      </div>
                      <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-atg-surface/50 px-3 py-2">
                        <span className="shrink-0 text-xs text-atg-muted">
                          {tColumns('pricePerDay')}
                        </span>
                        <span className="min-w-0 truncate tabular-nums text-sm font-semibold text-atg-fg">
                          {formatPrice(vehicle.dailyPriceCents, vehicle.currency)}
                        </span>
                      </div>
                      <div className="mt-auto flex min-w-0 justify-end border-t border-atg-border pt-3">
                        {renderVehicleActions(vehicle)}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
              <ul className="divide-y divide-atg-border">
                {vehicles.map((vehicle) => {
                  const categoryName = categoryById.get(vehicle.categoryId);
                  const label = getVehicleLabel(vehicle, categoryById, t('fallbackLabel'));
                  return (
                    <li
                      key={vehicle.id}
                      className="flex min-w-0 flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <VehicleThumbnail
                          vehicleId={vehicle.id}
                          label={label}
                          categoryName={categoryName}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs font-semibold text-atg-fg ring-1 ring-atg-border/60">
                              {vehicle.licensePlate ?? emptyDash}
                            </code>
                            <span className="min-w-0 truncate text-sm text-atg-muted">
                              {agencyById.get(vehicle.agencyId) ?? emptyDash}
                            </span>
                          </div>
                          <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-2">
                            {renderCategory(vehicle.categoryId)}
                            <span className="tabular-nums text-sm text-atg-fg">
                              {formatPrice(vehicle.dailyPriceCents, vehicle.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-0 shrink-0 justify-end">
                        {renderVehicleActions(vehicle)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('vehicle')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
        title={tDialogs('deleteTitle')}
        description={
          pendingDelete
            ? tDialogs('deleteDescription', {
                label: getVehicleLabel(pendingDelete, categoryById, t('fallbackLabel')),
              })
            : undefined
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
