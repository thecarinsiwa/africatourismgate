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
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Amenity } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAmenityIcon } from '../../lib/amenity-icon-map';
import { getApiClient } from '../../lib/auth/api';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type AmenityFormValues = { code: string; name: string };
type AmenitiesViewMode = 'grid' | 'table';

const emptyForm: AmenityFormValues = { code: '', name: '' };

export function AmenitiesList() {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.properties.amenitiesList');
  const tColumns = useTranslations('modules.common.columns');
  const tValidation = useTranslations('modules.common.validation');
  const tPagination = useTranslations('modules.common.pagination');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tToast = useTranslations('modules.common.toast');
  const { toast } = useToast();
  const tNav = useTranslations('nav.links');
  const tDates = useTranslations('modules.common.dates');
  const formatDateTime = useFormatDateTime('short');
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<AmenitiesViewMode>('grid');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; amenities: Amenity[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [viewing, setViewing] = useState<Amenity | null>(null);
  const [formValues, setFormValues] = useState<AmenityFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Amenity | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAmenities({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        amenities: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [page, search, getHebergementsErrorMessage]);

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

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  function openView(a: Amenity) {
    setViewing(a);
  }

  function openCreate() {
    setViewing(null);
    resetForm();
    setShowForm(true);
  }

  function openEdit(a: Amenity) {
    setViewing(null);
    setEditing(a);
    setFormValues({ code: a.code, name: a.name });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.code.trim() || !formValues.name.trim()) {
      setFormError(tValidation('codeAndNameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        code: formValues.code.trim().toLowerCase(),
        name: formValues.name.trim(),
      };
      if (editing) {
        await getApiClient().updateAmenity(editing.id, body);
      } else {
        await getApiClient().createAmenity(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getHebergementsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((a: Amenity) => {
    setConfirmTarget(a);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const a = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(a.id);
    try {
      await getApiClient().deleteAmenity(a.id);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedAmenity', { name: a.name }),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getHebergementsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getHebergementsErrorMessage, load, toast, tToast]);

  const renderAmenityActions = useCallback(
    (amenity: Amenity) => (
      <DataTableActions>
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          onClick={() => openView(amenity)}
        />
        <DataTableActionButton
          action="edit"
          label={tActions('edit')}
          onClick={() => openEdit(amenity)}
        />
        <DataTableActionButton
          action="delete"
          label={tActions('delete')}
          onClick={() => handleDeleteRequest(amenity)}
          disabled={deletingId === amenity.id}
          loading={deletingId === amenity.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest, tActions],
  );

  const columns = useMemo<ColumnDef<Amenity, unknown>[]>(
    () => [
      {
        id: 'icon',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-atg-surface text-primary">
            {getAmenityIcon(row.original.code, 'h-4 w-4')}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: tColumns('name'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'code',
        header: tColumns('code'),
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted">
            {row.original.code}
          </code>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderAmenityActions(row.original),
      },
    ],
    [renderAmenityActions, tColumns],
  );

  const amenities = state.status === 'ready' ? state.amenities : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <ListViewModeToggle
            value={viewMode}
            options={viewModeOptions}
            onChange={setViewMode}
            ariaLabel={t('viewModeAria')}
          />
        </div>
        <div className="flex gap-2">
          <Button href="/hebergements" variant="outline">
            {tNav('accommodations')}
          </Button>
          <Button type="button" onClick={openCreate}>
            {t('newAmenity')}
          </Button>
        </div>
      </div>

      <Modal
        open={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={t('viewAmenity')}
        showClose
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        {viewing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-atg-border bg-atg-surface/60 px-4 py-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary">
                {getAmenityIcon(viewing.code, 'h-6 w-6')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-atg-fg">{viewing.name}</p>
                <code className="font-mono text-xs text-atg-muted">{viewing.code}</code>
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tColumns('name')}
                </dt>
                <dd className="mt-1 text-sm text-atg-fg">{viewing.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tColumns('code')}
                </dt>
                <dd className="mt-1 font-mono text-sm text-atg-fg">{viewing.code}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tDates('createdAt')}
                </dt>
                <dd className="mt-1 text-sm tabular-nums text-atg-fg">
                  {formatDateTime(viewing.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tDates('updatedAt')}
                </dt>
                <dd className="mt-1 text-sm tabular-nums text-atg-fg">
                  {viewing.updatedAt ? formatDateTime(viewing.updatedAt) : emptyDash}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap justify-end gap-2 border-t border-atg-border pt-4">
              <Button type="button" variant="outline" onClick={() => setViewing(null)}>
                {tActions('close')}
              </Button>
              <Button type="button" onClick={() => openEdit(viewing)}>
                {tActions('edit')}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? t('editAmenity') : t('newAmenity')}
        showClose={!submitting}
        closeAriaLabel={tActions('cancel')}
        className="max-w-lg"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={tColumns('code')}
            value={formValues.code}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, code: e.target.value.toLowerCase() }))
            }
            disabled={Boolean(editing) || submitting}
            required
          />
          <Input
            label={tColumns('name')}
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            disabled={submitting}
            required
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
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          {viewMode === 'table' ? (
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={amenities}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={t('empty')}
                getRowId={(row) => row.id}
                aria-label={t('ariaLabel')}
              />
            </Card>
          ) : state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
          ) : amenities.length === 0 ? (
            <p className="text-sm text-atg-muted">{t('empty')}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {amenities.map((a) => (
                <li key={a.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary">
                        {getAmenityIcon(a.code, 'h-5 w-5')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-atg-fg">{a.name}</p>
                        <code className="font-mono text-xs text-atg-muted">{a.code}</code>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderAmenityActions(a)}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('amenity')}
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
