'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  type ColumnDef,
  useToast,
} from '@africatourismgate/ui';
import type {
  Destination,
  OrganizationListItem,
  TourGuide,
  TourGuideStatus,
  TourGuideType,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { exportCsv } from '../../lib/export-csv';
import {
  useTourGuideStatusFilterOptions,
  useTourGuideStatusLabels,
  useTourGuideTypeFilterOptions,
  useTourGuideTypeLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { TourGuideAvatar } from './tour-guide-avatar';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type TypeFilter = '' | TourGuideType;
type StatusFilter = '' | TourGuideStatus;

const STATUS_VARIANTS: Record<TourGuideStatus, 'success' | 'muted'> = {
  active: 'success',
  inactive: 'muted',
};

function formatDestinationLabels(
  guide: TourGuide,
  nameById: Map<string, string>,
  emptyDash: string,
  max = 3,
): string {
  if (guide.destinations.length === 0) return emptyDash;
  const labels = guide.destinations.map((id) => nameById.get(id) ?? id.slice(0, 8));
  if (labels.length <= max) return labels.join(', ');
  return `${labels.slice(0, max).join(', ')} +${labels.length - max}`;
}

export function TourGuidesList() {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.list');
  const tColumns = useTranslations('modules.tourGuides.columns');
  const tFilters = useTranslations('modules.tourGuides.filters');
  const tDestColumns = useTranslations('modules.destinations.columns');
  const tUsersFilters = useTranslations('modules.users.filters');
  const tCommon = useTranslations('modules.common');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tExport = useTranslations('modules.common.exportCsv');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const tForm = useTranslations('modules.tourGuides.form');
  const typeLabels = useTourGuideTypeLabels();
  const statusLabels = useTourGuideStatusLabels();
  const typeOptions = useTourGuideTypeFilterOptions();
  const statusOptions = useTourGuideStatusFilterOptions();
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();
  const emptyDash = tCommon('empty.dash');

  const [canWrite, setCanWrite] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        guides: TourGuide[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TourGuide | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('guides.write'));
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadLookups() {
      try {
        const client = getApiClient();
        const [destinationsResult, organizationsResult] = await Promise.all([
          client.listDestinations({ page: 1, limit: 200 }),
          client.listOrganizations({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setDestinations(destinationsResult.data);
          setOrganizations(organizationsResult.data);
        }
      } catch {
        if (!cancelled) {
          setDestinations([]);
          setOrganizations([]);
        }
      }
    }
    void loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  const destinationNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const destination of destinations) {
      map.set(destination.id, destination.name);
    }
    return map;
  }, [destinations]);

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...destinations.map((destination) => ({
        value: destination.id,
        label: destination.name,
      })),
    ],
    [destinations, tCommon],
  );

  const organizationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations, tCommon],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listTourGuides({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        destinationId: destinationFilter || undefined,
        organizationId: organizationFilter || undefined,
      });
      setState({
        status: 'ready',
        guides: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [
    destinationFilter,
    getTourGuidesErrorMessage,
    organizationFilter,
    page,
    search,
    statusFilter,
    typeFilter,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) {
          setPage(1);
        }
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDeleteRequest = useCallback((guide: TourGuide) => {
    setConfirmTarget(guide);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const guide = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(guide.id);
    try {
      await getApiClient().deleteTourGuide(guide.id);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedTourGuide', { name: guide.displayName }),
      });
    } catch (error) {
      const message = getTourGuidesErrorMessage(error);
      setDeleteError(message);
      toast({
        variant: 'error',
        message,
      });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getTourGuidesErrorMessage, load, tToast, toast]);

  const columns = useMemo<ColumnDef<TourGuide, unknown>[]>(() => {
    const actionColumns: ColumnDef<TourGuide, unknown>[] = [
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const guide = row.original;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action="view"
                label={tActions('view')}
                href={`/guides/${guide.id}/voir`}
              />
              {canWrite ? (
                <>
                  <DataTableActionButton
                    action="edit"
                    label={tActions('edit')}
                    href={`/guides/${guide.id}`}
                  />
                  <DataTableActionButton
                    action="delete"
                    label={tActions('delete')}
                    onClick={() => handleDeleteRequest(guide)}
                    disabled={deletingId === guide.id}
                    loading={deletingId === guide.id}
                  />
                </>
              ) : null}
            </DataTableActions>
          );
        },
      },
    ];

    return [
      {
        accessorKey: 'displayName',
        header: tColumns('name'),
        cell: ({ row }) => {
          const guide = row.original;
          const user = guide.user;
          return (
            <div className="flex items-center gap-3">
              <TourGuideAvatar guide={guide} />
              <div className="min-w-0">
                <Link
                  href={`/guides/${guide.id}/voir`}
                  className="block truncate font-medium text-atg-fg hover:text-primary"
                >
                  {guide.displayName}
                </Link>
                {user ? (
                  <span className="block truncate text-xs text-atg-muted">{user.email}</span>
                ) : guide.type === 'external' ? (
                  <span className="block truncate text-xs text-atg-muted">
                    {typeLabels.external}
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: tColumns('type'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{typeLabels[row.original.type]}</span>
        ),
      },
      {
        id: 'destinations',
        header: tColumns('destinations'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatDestinationLabels(row.original, destinationNameById, emptyDash)}
          </span>
        ),
      },
      {
        id: 'organization',
        header: tColumns('organization'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) return <span className="text-atg-muted">{emptyDash}</span>;
          return (
            <span className="text-sm text-atg-muted">
              {orgNameById.get(orgId) ?? orgId.slice(0, 8)}
            </span>
          );
        },
      },
      {
        accessorKey: 'languages',
        header: tColumns('languages'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.languages.join(', ')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={STATUS_VARIANTS[row.original.status]}>
            {statusLabels[row.original.status]}
          </DataTableBadge>
        ),
      },
      ...actionColumns,
    ];
  }, [
    canWrite,
    deletingId,
    destinationNameById,
    emptyDash,
    handleDeleteRequest,
    orgNameById,
    statusLabels,
    tActions,
    tColumns,
    tCommon,
    typeLabels,
  ]);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const guides = state.status === 'ready' ? state.guides : [];
  const activeFilterCount = [
    search.trim().length > 0,
    typeFilter !== '',
    statusFilter !== '',
    destinationFilter !== '',
    organizationFilter !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setDestinationFilter('');
    setOrganizationFilter('');
    setPage(1);
  }, []);

  const handleExportCsv = useCallback(() => {
    if (guides.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    exportCsv({
      filename: `guides-${date}.csv`,
      columns: [
        { header: tColumns('name'), value: (row) => row.displayName },
        {
          header: tColumns('type'),
          value: (row) => typeLabels[row.type],
        },
        {
          header: tColumns('destinations'),
          value: (row) =>
            formatDestinationLabels(row, destinationNameById, emptyDash, 20),
        },
        {
          header: tColumns('organization'),
          value: (row) =>
            row.organizationId
              ? (orgNameById.get(row.organizationId) ?? row.organizationId)
              : emptyDash,
        },
        {
          header: tColumns('languages'),
          value: (row) => row.languages.join(', '),
        },
        {
          header: tColumns('status'),
          value: (row) => statusLabels[row.status],
        },
        {
          header: tForm('contactEmail'),
          value: (row) => row.user?.email ?? row.contactEmail ?? emptyDash,
        },
      ],
      rows: guides,
    });
    toast({ variant: 'success', message: tExport('success') });
  }, [
    destinationNameById,
    emptyDash,
    guides,
    orgNameById,
    statusLabels,
    tColumns,
    tExport,
    tForm,
    toast,
    typeLabels,
  ]);

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.displayName }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <div className="space-y-6">
        <FilterBar
          mobileVariant="drawer"
          activeCount={activeFilterCount}
          onClear={handleClearFilters}
          clearLabel={tCommonFilters('clearAll')}
          toggleLabel={tCommonFilters('toggle')}
          applyLabel={tCommonFilters('apply')}
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || guides.length === 0}
              onClick={handleExportCsv}
            >
              {tExport('button')}
            </Button>
          }
          filters={
            <>
              <div className="min-w-[200px] flex-1 sm:max-w-md">
                <Input
                  name="search"
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label={t('searchAria')}
                />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  label={tFilters('type')}
                  value={typeFilter}
                  options={typeOptions}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as TypeFilter);
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  label={tFilters('status')}
                  value={statusFilter}
                  options={statusOptions}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  label={tDestColumns('destination')}
                  value={destinationFilter}
                  options={destinationOptions}
                  onChange={(e) => {
                    setDestinationFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  label={tUsersFilters('organization')}
                  value={organizationFilter}
                  options={organizationOptions}
                  onChange={(e) => {
                    setOrganizationFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </>
          }
        />

        {isError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.message}
          </p>
        ) : (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={guides}
                isLoading={isLoading}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={hasFilters ? 'search' : 'default'}
                getRowId={(row) => row.id}
                aria-label={t('ariaLabel')}
              />
            </Card>

            {state.status === 'ready' && state.totalPages > 1 ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tCommon('pagination.guide')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
