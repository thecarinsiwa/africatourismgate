'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { usePropertyTypeLabels } from '../../lib/i18n/use-module-labels';

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
import type { Destination, Property } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { PropertiesExportDialog } from './properties-export-dialog';
import { PropertyThumbnail } from './property-thumbnail';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type PropertiesViewMode = 'table' | 'grid' | 'compact';

export function PropertiesList() {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.properties.list');
  const tFilters = useTranslations('modules.properties.filters');
  const tColumns = useTranslations('modules.properties.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tDialogs = useTranslations('modules.properties.dialogs');
  const tExports = useTranslations('modules.properties.exports');
  const tToast = useTranslations('modules.common.toast');
  const tActions = useTranslations('common.actions');
  const propertyTypeLabels = usePropertyTypeLabels();
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        properties: Property[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<PropertiesViewMode>('table');
  const [exportOpen, setExportOpen] = useState(false);
  const [canExportBookings, setCanExportBookings] = useState(false);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
  }, []);

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

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listProperties({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        destinationId: destinationFilter || undefined,
      });
      setState({
        status: 'ready',
        properties: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [page, search, destinationFilter, getHebergementsErrorMessage]);

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

  const destinationNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of destinations) {
      map.set(d.id, d.name);
    }
    return map;
  }, [destinations]);

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tCommonFilters('allFeminine') },
      ...destinations.map((d) => ({ value: d.id, label: d.name })),
    ],
    [destinations, tCommonFilters],
  );

  const viewModeOptions = useMemo(
    () => [
      { value: 'table' as const, label: tList('viewTable') },
      { value: 'grid' as const, label: tList('viewGrid') },
      { value: 'compact' as const, label: tList('viewCompact') },
    ],
    [tList],
  );

  const renderPropertyActions = useCallback(
    (property: Property) => (
      <DataTableActions>
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/hebergements/${property.id}/voir`}
        />
        <DataTableActionButton
          action="edit"
          label={tActions('edit')}
          href={`/hebergements/${property.id}`}
        />
        <DataTableActionButton
          action="delete"
          label={tActions('delete')}
          onClick={() => setPendingDelete(property)}
          disabled={deletingId === property.id}
          loading={deletingId === property.id}
        />
      </DataTableActions>
    ),
    [deletingId, tActions],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const property = pendingDelete;
    setDeletingId(property.id);
    try {
      await getApiClient().deleteProperty(property.id);
      setPendingDelete(null);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedProperty', { name: property.name }),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getHebergementsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [pendingDelete, load, toast, tToast, getHebergementsErrorMessage]);

  const columns = useMemo<ColumnDef<Property, unknown>[]>(
    () => [
      {
        id: 'thumbnail',
        header: '',
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <PropertyThumbnail propertyId={row.original.id} name={row.original.name} size="md" />
        ),
      },
      {
        accessorKey: 'name',
        header: tColumns('property'),
        cell: ({ row }) => (
          <span className="block min-w-0 truncate font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'slug',
        header: tCommonColumns('slug'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted">
            {row.original.slug}
          </code>
        ),
      },
      {
        id: 'destination',
        header: tColumns('destination'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {destinationNameById.get(row.original.destinationId) ?? row.original.destinationId}
          </span>
        ),
      },
      {
        accessorKey: 'propertyType',
        header: tColumns('propertyType'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {propertyTypeLabels[row.original.propertyType]}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderPropertyActions(row.original),
      },
    ],
    [destinationNameById, propertyTypeLabels, renderPropertyActions, tColumns, tCommonColumns],
  );

  const properties = state.status === 'ready' ? state.properties : [];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder={tList('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={tList('searchAria')}
            />
          </div>
          <div className="sm:w-56">
            <Select
              label={tFilters('destination')}
              value={destinationFilter}
              options={destinationOptions}
              onChange={(e) => {
                setDestinationFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <ListViewModeToggle
            value={viewMode}
            options={viewModeOptions}
            onChange={setViewMode}
            ariaLabel={tList('viewModeAria')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            {tExports('button')}
          </Button>
          <Button href="/hebergements/equipements" variant="outline">
            {tList('amenitiesLink')}
          </Button>
          <Button href="/hebergements/nouveau">{tList('newProperty')}</Button>
        </div>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          {viewMode === 'table' ? (
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={properties}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={tList('emptyDefault')}
                expandRowLabel={tDataTable('expandRow')}
                collapseRowLabel={tDataTable('collapseRow')}
                expandRowAriaLabel={tDataTable('expandRowAria')}
                getRowId={(row) => row.id}
                aria-label={tList('ariaLabel')}
              />
            </Card>
          ) : state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">{tDataTable('loading')}</p>
          ) : properties.length === 0 ? (
            <p className="text-sm text-atg-muted">{tList('emptyDefault')}</p>
          ) : viewMode === 'grid' ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {properties.map((property) => (
                <li key={property.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-4">
                    <PropertyThumbnail
                      propertyId={property.id}
                      name={property.name}
                      size="md"
                      className="!h-36 !w-full max-w-none rounded-lg"
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-atg-fg">{property.name}</p>
                      <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted">
                        {property.slug}
                      </code>
                      <p className="text-sm text-atg-muted">
                        {destinationNameById.get(property.destinationId) ?? property.destinationId}
                      </p>
                      <p className="text-sm text-atg-muted">
                        {propertyTypeLabels[property.propertyType]}
                      </p>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderPropertyActions(property)}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <ul className="divide-y divide-atg-border">
                {properties.map((property) => (
                  <li
                    key={property.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <PropertyThumbnail propertyId={property.id} name={property.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-atg-fg">{property.name}</p>
                        <p className="truncate text-sm text-atg-muted">
                          {destinationNameById.get(property.destinationId) ?? property.destinationId}
                          {' · '}
                          {propertyTypeLabels[property.propertyType]}
                        </p>
                        <code className="font-mono text-xs text-atg-muted">{property.slug}</code>
                      </div>
                    </div>
                    <div className="flex shrink-0 justify-end">{renderPropertyActions(property)}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('property')}
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
            ? tDialogs('deleteDescription', { name: pendingDelete.name })
            : undefined
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <PropertiesExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        search={search}
        destinationId={destinationFilter}
        canExportBookings={canExportBookings}
      />
    </div>
  );
}
