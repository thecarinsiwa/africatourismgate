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
  Modal,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination, RentalAgency } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { RentalAgenciesStatCards } from './rental-agencies-stat-cards';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string; destinationId: string; address: string };
type AgenciesViewMode = 'grid' | 'table';

const emptyForm: FormValues = { name: '', destinationId: '', address: '' };

export function RentalAgenciesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.agencies');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tDestinations = useTranslations('modules.destinations.columns');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<AgenciesViewMode>('grid');
  const [statsKey, setStatsKey] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; agencies: RentalAgency[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RentalAgency | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<RentalAgency | null>(null);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
  }, []);

  const destById = useMemo(
    () => new Map(destinations.map((d) => [d.id, d.name])),
    [destinations],
  );

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.none') },
      ...destinations.map((d) => ({ value: d.id, label: d.name })),
    ],
    [destinations, tCommon],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listRentalAgencies({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        agencies: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [page, search, getLocationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

  function openForm(agency?: RentalAgency) {
    if (agency) {
      setEditing(agency);
      setFormValues({
        name: agency.name,
        destinationId: agency.destinationId ?? '',
        address: agency.address ?? '',
      });
    } else {
      setEditing(null);
      setFormValues(emptyForm);
    }
    setFormError(null);
    setShowForm(true);
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.name.trim()) {
      setFormError(tCommon('validation.nameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: formValues.name.trim(),
        destinationId: formValues.destinationId || null,
        address: formValues.address.trim() || null,
      };
      if (editing) {
        await getApiClient().updateRentalAgency(editing.id, body);
        toast({
          variant: 'success',
          title: tToast('saved'),
          message: body.name,
        });
      } else {
        await getApiClient().createRentalAgency({
          name: body.name,
          ...(body.destinationId ? { destinationId: body.destinationId } : {}),
          ...(body.address ? { address: body.address } : {}),
        });
        toast({
          variant: 'success',
          title: tToast('created'),
          message: body.name,
        });
      }
      resetForm();
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((agency: RentalAgency) => {
    setConfirmTarget(agency);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const agency = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(agency.id);
    try {
      await getApiClient().deleteRentalAgency(agency.id);
      toast({
        variant: 'success',
        title: tToast('deleted'),
        message: agency.name,
      });
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      const message = getLocationsErrorMessage(error);
      setDeleteError(message);
      toast({ variant: 'error', title: tToast('deleteError'), message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getLocationsErrorMessage, load, tToast, toast]);

  const renderActions = useCallback(
    (agency: RentalAgency) => (
      <DataTableActions>
        <DataTableActionButton action="edit" onClick={() => openForm(agency)} />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(agency)}
          disabled={deletingId === agency.id}
          loading={deletingId === agency.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

  const columns = useMemo<ColumnDef<RentalAgency, unknown>[]>(
    () => [
      { accessorKey: 'name', header: t('agency') },
      {
        id: 'destination',
        header: tDestinations('destination'),
        cell: ({ row }) =>
          row.original.destinationId
            ? (destById.get(row.original.destinationId) ?? emptyDash)
            : emptyDash,
      },
      {
        accessorKey: 'address',
        header: t('address'),
        cell: ({ row }) => row.original.address ?? emptyDash,
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [destById, emptyDash, renderActions, t, tCommon, tDestinations],
  );

  const agencies = state.status === 'ready' ? state.agencies : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={
          confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''
        }
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <div className="space-y-6">
        <RentalAgenciesStatCards refreshKey={statsKey} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <ListViewModeToggle
              value={viewMode}
              options={viewModeOptions}
              onChange={setViewMode}
              ariaLabel={t('viewModeAria')}
            />
          </div>
          <Button type="button" onClick={() => openForm()}>
            {t('new')}
          </Button>
        </div>

        <Modal
          open={showForm}
          onOpenChange={(open) => {
            if (!open && !submitting) resetForm();
          }}
          title={editing ? t('edit') : t('new')}
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

            <div className="rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3">
              <p className="truncate text-sm font-semibold text-atg-fg">
                {formValues.name.trim() || t('agency')}
              </p>
              <p className="mt-0.5 truncate text-xs text-atg-muted">
                {formValues.destinationId
                  ? (destById.get(formValues.destinationId) ?? emptyDash)
                  : t('destinationOptional')}
                {formValues.address.trim()
                  ? ` · ${formValues.address.trim()}`
                  : ''}
              </p>
            </div>

            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, name: e.target.value }))
              }
              disabled={submitting}
              required
            />
            <Select
              label={t('destinationOptional')}
              value={formValues.destinationId}
              options={destinationOptions}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, destinationId: e.target.value }))
              }
              disabled={submitting}
            />
            <Input
              label={t('address')}
              value={formValues.address}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, address: e.target.value }))
              }
              disabled={submitting}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={submitting}
              >
                {tActions('cancel')}
              </Button>
              <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
            </div>
          </form>
        </Modal>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={agencies}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
              />
            </Card>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('agency')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : agencies.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {agencies.map((agency) => (
                <li key={agency.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-atg-fg">
                        {agency.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-atg-muted">
                        {agency.destinationId
                          ? (destById.get(agency.destinationId) ?? emptyDash)
                          : emptyDash}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-atg-muted">
                        {agency.address ?? emptyDash}
                      </p>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(agency)}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('agency')}
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
