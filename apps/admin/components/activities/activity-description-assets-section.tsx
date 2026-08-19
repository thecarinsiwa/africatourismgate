'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  ActivityDescriptionAsset,
  ActivityDescriptionAssetType,
  CreateActivityDescriptionAssetRequest,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';

const ACTIVITY_DESCRIPTION_ASSET_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_ASSET_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

type FormValues = {
  assetType: ActivityDescriptionAssetType;
  name: string;
  url: string;
  sortOrder: string;
};

const emptyForm: FormValues = {
  assetType: 'image',
  name: '',
  url: '',
  sortOrder: '0',
};

type ActivityDescriptionAssetsSectionProps = {
  activityId?: string;
  onChanged?: () => void;
};

export function ActivityDescriptionAssetsSection({
  activityId,
  onChanged,
}: ActivityDescriptionAssetsSectionProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.activities.form.attachments');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');

  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; assets: ActivityDescriptionAsset[] }
  >({ status: activityId ? 'loading' : 'idle' });
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ActivityDescriptionAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!activityId) return;
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivityDescriptionAssets({
        activityId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', assets: result.data });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [activityId, getActivitiesErrorMessage]);

  useEffect(() => {
    if (!activityId) return;
    void load();
  }, [activityId, load]);

  const assets = state.status === 'ready' ? state.assets : [];

  function resetForm() {
    setShowForm(false);
    setFormValues(emptyForm);
    setFormError(null);
  }

  async function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activityId) return;
    setFormError(null);
    try {
      if (!ALLOWED_ASSET_MIME_TYPES.has(file.type)) {
        setFormError(t('validation.invalidType'));
        return;
      }
      if (file.size > ACTIVITY_DESCRIPTION_ASSET_MAX_BYTES) {
        setFormError(t('validation.fileTooLarge'));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFormError(tCommon('validation.sessionExpiredRetry'));
        return;
      }
      setUploading(true);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(
        `${resolveApiBaseUrl()}/activities/${activityId}/upload-description-asset`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body,
        },
      );
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const payload = (await response.json()) as {
        url?: string;
        assetType?: ActivityDescriptionAssetType;
      };
      if (!payload.url || !payload.assetType) {
        throw new Error('Invalid upload response');
      }
      setFormValues((prev) => ({
        ...prev,
        url: payload.url ?? prev.url,
        assetType: payload.assetType ?? prev.assetType,
        name: prev.name || file.name,
      }));
    } catch {
      setFormError(tCommon('validation.uploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!activityId) return;
    setFormError(null);
    if (!formValues.url.trim()) {
      setFormError(tCommon('validation.urlRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const body: CreateActivityDescriptionAssetRequest = {
        activityId,
        assetType: formValues.assetType,
        url: formValues.url.trim(),
        sortOrder: Number(formValues.sortOrder) || 0,
        ...(formValues.name.trim() ? { name: formValues.name.trim() } : {}),
      };
      await getApiClient().createActivityDescriptionAsset(body);
      resetForm();
      await load();
      onChanged?.();
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((asset: ActivityDescriptionAsset) => {
    setConfirmTarget(asset);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const asset = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(asset.id);
    try {
      await getApiClient().deleteActivityDescriptionAsset(asset.id);
      await load();
      onChanged?.();
    } catch (error) {
      setDeleteError(getActivitiesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getActivitiesErrorMessage, load, onChanged]);

  const columns = useMemo<ColumnDef<ActivityDescriptionAsset, unknown>[]>(
    () => [
      {
        id: 'preview',
        header: tCommon('columns.preview'),
        cell: ({ row }) =>
          row.original.assetType === 'image' ? (
            <Image
              src={row.original.url}
              alt={row.original.name ?? ''}
              width={64}
              height={40}
              unoptimized
              className="h-10 w-16 rounded object-cover"
            />
          ) : (
            <span className="text-xs uppercase text-atg-muted">{row.original.assetType}</span>
          ),
      },
      {
        id: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">{row.original.name ?? t('unnamed')}</span>
        ),
      },
      {
        id: 'type',
        header: tCommon('columns.type'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.assetType.toUpperCase()}</span>
        ),
      },
      {
        accessorKey: 'url',
        header: tCommon('columns.url'),
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noreferrer"
            className="max-w-xs truncate text-sm text-primary hover:underline"
          >
            {row.original.url}
          </a>
        ),
      },
      {
        accessorKey: 'sortOrder',
        header: tCommon('columns.sortOrder'),
        meta: { align: 'center' },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDeleteRequest, t, tCommon],
  );

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name ?? confirmTarget.url }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <Card variant="dashboard" className="mt-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
          <p className="mt-1 text-xs text-atg-muted">{t('hint')}</p>
        </div>
        {activityId && !showForm ? (
          <Button type="button" size="sm" onClick={() => setShowForm(true)}>
            {t('add')}
          </Button>
        ) : null}
      </div>

      {!activityId ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {t('saveFirst')}
        </p>
      ) : null}

      {formError ? <p className="text-sm text-red-600 dark:text-red-400">{formError}</p> : null}

      {activityId && showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-atg-border p-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
              {uploading ? tCommon('form.uploading') : tCommon('form.chooseFile')}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(event) => void handleFilePick(event)}
                disabled={uploading || submitting}
              />
            </label>
            <span className="text-xs text-atg-muted">{t('fileHint')}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t('fields.name')}
              value={formValues.name}
              onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
            />
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-atg-fg">{t('fields.type')}</span>
              <select
                value={formValues.assetType}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    assetType: e.target.value as ActivityDescriptionAssetType,
                  }))
                }
                className="min-h-[40px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
              >
                <option value="image">{t('types.image')}</option>
                <option value="pdf">{t('types.pdf')}</option>
                <option value="word">{t('types.word')}</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Input
              label={tCommon('columns.url')}
              value={formValues.url}
              onChange={(e) => setFormValues((prev) => ({ ...prev, url: e.target.value }))}
              placeholder={tCommon('form.urlPlaceholder')}
            />
            <Input
              label={tCommon('form.displayOrder')}
              type="number"
              min={0}
              value={formValues.sortOrder}
              onChange={(e) => setFormValues((prev) => ({ ...prev, sortOrder: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={submitting} disabled={uploading}>
              {tActions('add')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      ) : null}

      {activityId ? (
        state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : (
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={assets}
              isLoading={state.status === 'loading'}
              emptyMessage={t('empty')}
              getRowId={(row) => row.id}
            />
          </Card>
        )
      ) : null}
    </Card>
    </>
  );
}
