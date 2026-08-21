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
import type { Airline } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { AirlineLogo } from './airline-logo-placeholder';
import { AirlinesStatCards } from './airlines-stat-cards';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type FormValues = {
  iataCode: string;
  name: string;
  logoUrl: string | null;
};

type AirlinesViewMode = 'grid' | 'table';

const emptyForm: FormValues = { iataCode: '', name: '', logoUrl: null };

export function AirlinesList() {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.referential.airlines');
  const tColumns = useTranslations('modules.flights.columns');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<AirlinesViewMode>('grid');
  const [statsKey, setStatsKey] = useState(0);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; airlines: Airline[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Airline | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Airline | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAirlines({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        airlines: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [page, search, getVolsErrorMessage]);

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

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

  function clearLocalPreview() {
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
  }

  function resetForm() {
    clearLocalPreview();
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openForm(airline?: Airline) {
    clearLocalPreview();
    if (airline) {
      setEditing(airline);
      setFormValues({
        iataCode: airline.iataCode,
        name: airline.name,
        logoUrl: airline.logoUrl,
      });
    } else {
      setEditing(null);
      setFormValues(emptyForm);
    }
    setFormError(null);
    setShowForm(true);
  }

  function handleLogoPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setFormError(tCommon('validation.imageFormat'));
      event.target.value = '';
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setFormError(tCommon('validation.imageTooLarge'));
      event.target.value = '';
      return;
    }
    setFormError(null);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  }

  function handleRemoveLogo() {
    clearLocalPreview();
    setFormValues((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadLogo(airlineId: string, file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);
    const { url } = await getApiClient().uploadAirlineImage(airlineId, body);
    return url;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (formValues.iataCode.trim().length !== 2 || !formValues.name.trim()) {
      setFormError(tCommon('validation.iataAndNameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const client = getApiClient();
      const base = {
        iataCode: formValues.iataCode.trim().toUpperCase(),
        name: formValues.name.trim(),
      };

      if (editing) {
        let logoUrl = formValues.logoUrl;
        if (pendingFile) {
          setUploading(true);
          logoUrl = await uploadLogo(editing.id, pendingFile);
        }
        await client.updateAirline(editing.id, { ...base, logoUrl });
        toast({
          variant: 'success',
          title: tToast('saved'),
          message: base.name,
        });
      } else {
        const created = await client.createAirline(base);
        if (pendingFile) {
          setUploading(true);
          const logoUrl = await uploadLogo(created.id, pendingFile);
          await client.updateAirline(created.id, { logoUrl });
        }
        toast({
          variant: 'success',
          title: tToast('created'),
          message: base.name,
        });
      }

      resetForm();
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((airline: Airline) => {
    setConfirmTarget(airline);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const airline = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(airline.id);
    try {
      await getApiClient().deleteAirline(airline.id);
      toast({
        variant: 'success',
        title: tToast('deleted'),
        message: airline.name,
      });
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      const message = getVolsErrorMessage(error);
      setDeleteError(message);
      toast({ variant: 'error', title: tToast('deleteError'), message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getVolsErrorMessage, load, tToast, toast]);

  const renderActions = useCallback(
    (airline: Airline) => (
      <DataTableActions>
        <DataTableActionButton action="edit" onClick={() => openForm(airline)} />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(airline)}
          disabled={deletingId === airline.id}
          loading={deletingId === airline.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

  const columns = useMemo<ColumnDef<Airline, unknown>[]>(
    () => [
      {
        id: 'logo',
        header: t('logo'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <AirlineLogo
            iataCode={row.original.iataCode}
            logoUrl={row.original.logoUrl}
            label={row.original.name}
          />
        ),
      },
      {
        accessorKey: 'iataCode',
        header: tCommon('columns.iata'),
        cell: ({ row }) => (
          <code className="font-mono text-sm">{row.original.iataCode}</code>
        ),
      },
      { accessorKey: 'name', header: tColumns('airline') },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions, t, tColumns, tCommon],
  );

  const airlines = state.status === 'ready' ? state.airlines : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');
  const previewSrc =
    localPreviewUrl ??
    (formValues.logoUrl?.trim() ? resolveMediaUrl(formValues.logoUrl.trim()) : null);
  const busy = submitting || uploading;

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
        <AirlinesStatCards refreshKey={statsKey} />

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
            if (!open && !busy) resetForm();
          }}
          title={editing ? t('edit') : t('new')}
          showClose={!busy}
          closeAriaLabel={tActions('close')}
          className="max-w-lg"
        >
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {formError ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {formError}
              </p>
            ) : null}

            <div className="rounded-xl border border-atg-border bg-atg-surface/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('logo')}
              </p>
              <p className="mt-1 text-xs text-atg-muted">{t('logoHint')}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob / remote preview
                  <img
                    src={previewSrc}
                    alt=""
                    className="h-16 w-16 rounded-lg object-contain ring-1 ring-atg-border/60"
                  />
                ) : (
                  <AirlineLogo
                    iataCode={formValues.iataCode || '??'}
                    size="lg"
                    label={formValues.name || t('logo')}
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleLogoPick}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('logoUpload')}
                  </Button>
                  {previewSrc || formValues.logoUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={handleRemoveLogo}
                    >
                      {t('logoRemove')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <Input
              label={t('iataCode')}
              maxLength={2}
              value={formValues.iataCode}
              onChange={(e) =>
                setFormValues((p) => ({
                  ...p,
                  iataCode: e.target.value.toUpperCase(),
                }))
              }
              disabled={busy}
              required
            />
            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, name: e.target.value }))
              }
              disabled={busy}
              required
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={busy}
              >
                {tActions('cancel')}
              </Button>
              <Button type="submit" loading={busy}>
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
                data={airlines}
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
                itemLabel={tPagination('airline')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : airlines.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {airlines.map((airline) => (
                <li key={airline.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <AirlineLogo
                        iataCode={airline.iataCode}
                        logoUrl={airline.logoUrl}
                        label={airline.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-atg-fg">
                          {airline.name}
                        </p>
                        <code className="mt-0.5 inline-block rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted">
                          {airline.iataCode}
                        </code>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(airline)}
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
                itemLabel={tPagination('airline')}
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
