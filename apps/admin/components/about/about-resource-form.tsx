'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Select, Textarea } from '@africatourismgate/ui';
import type {
  AboutResource,
  AboutResourceStatus,
  AboutResourceType,
  CreateAboutResourceRequest,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import { ABOUT_RESOURCE_TYPES } from '../../lib/about/constants';
import { isValidMediaUrl, toDatetimeLocalValue } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { usePermissions } from '../../lib/auth/use-permissions';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';

export const ABOUT_RESOURCES_HUB_HREF = '/contenu/site?tab=about-resources';

const FILE_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export type AboutResourceFormValues = {
  type: AboutResourceType;
  title: string;
  description: string;
  fileUrl: string;
  externalUrl: string;
  publishedAt: string;
  sortOrder: string;
  status: AboutResourceStatus;
  locale: string;
};

const defaultValues: AboutResourceFormValues = {
  type: 'financial',
  title: '',
  description: '',
  fileUrl: '',
  externalUrl: '',
  publishedAt: '',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function resourceToFormValues(resource: AboutResource): AboutResourceFormValues {
  return {
    type: resource.type,
    title: resource.title,
    description: resource.description ?? '',
    fileUrl: resource.fileUrl ?? '',
    externalUrl: resource.externalUrl ?? '',
    publishedAt: toDatetimeLocalValue(resource.publishedAt),
    sortOrder: String(resource.sortOrder),
    status: resource.status,
    locale: resource.locale,
  };
}

function toPayload(values: AboutResourceFormValues): CreateAboutResourceRequest {
  const publishedAt = values.publishedAt.trim();
  return {
    type: values.type,
    title: values.title.trim(),
    description: values.description.trim() || null,
    fileUrl: values.fileUrl.trim() || null,
    externalUrl: values.externalUrl.trim() || null,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type AboutResourceFormProps = {
  mode: 'create' | 'edit';
  resourceId?: string;
  initialResource?: AboutResource;
  defaultLocale?: string;
  cancelHref?: string;
};

export function AboutResourceForm({
  mode,
  resourceId,
  initialResource,
  defaultLocale = 'fr',
  cancelHref = ABOUT_RESOURCES_HUB_HREF,
}: AboutResourceFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('content.write');
  const t = useTranslations('modules.about.resources.form');
  const tTypes = useTranslations('modules.about.resourceTypes');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tStatus = useTranslations('modules.about.status');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const router = useRouter();
  const fileInputId = useId();

  const [values, setValues] = useState<AboutResourceFormValues>(() =>
    initialResource
      ? resourceToFormValues(initialResource)
      : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AboutResourceFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const typeOptions = useMemo(
    () => ABOUT_RESOURCE_TYPES.map((type) => ({ value: type, label: tTypes(type) })),
    [tTypes],
  );

  const statusOptions = useMemo(
    () =>
      (['draft', 'published'] as const).map((status) => ({
        value: status,
        label: tStatus(status),
      })),
    [tStatus],
  );

  const updateField = useCallback(
    <K extends keyof AboutResourceFormValues>(key: K, value: AboutResourceFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  async function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        setFieldErrors((prev) => ({ ...prev, fileUrl: t('validation.fileFormat') }));
        return;
      }
      if (file.size > FILE_MAX_BYTES) {
        setFieldErrors((prev) => ({ ...prev, fileUrl: t('validation.fileTooLarge') }));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFieldErrors((prev) => ({ ...prev, fileUrl: tValidation('sessionExpiredRetry') }));
        return;
      }
      setUploadingFile(true);
      setFieldErrors((prev) => ({ ...prev, fileUrl: undefined }));
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/about-resources/upload-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      updateField('fileUrl', payload.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, fileUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof AboutResourceFormValues, string>> = {};
    if (!values.title.trim()) errors.title = tCommon('validation.titleRequired');
    const fileUrl = values.fileUrl.trim();
    const externalUrl = values.externalUrl.trim();
    if (!fileUrl && !externalUrl) {
      errors.fileUrl = t('validation.fileOrUrlRequired');
    }
    if (fileUrl && !isValidMediaUrl(fileUrl)) {
      errors.fileUrl = t('validation.fileUrlInvalid');
    }
    if (externalUrl && !isValidMediaUrl(externalUrl)) {
      errors.externalUrl = t('validation.externalUrlInvalid');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const payload = toPayload(values);
      if (mode === 'create') {
        const created = await client.createAboutResource(payload);
        router.push(`/contenu/a-propos/ressources/${created.id}`);
        router.refresh();
      } else if (resourceId) {
        await client.updateAboutResource(resourceId, payload);
        router.push(cancelHref);
        router.refresh();
      }
    } catch (error) {
      setFormError(getAboutErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || uploadingFile;

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
          <p>{t('info.sectionHint')}</p>
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {formError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {mode === 'edit' ? (
            <div>
              <p className="mb-2 block text-sm font-medium text-atg-fg">{t('fields.type')}</p>
              <p className="text-sm text-atg-muted">{tTypes(values.type)}</p>
            </div>
          ) : (
            <Select
              label={t('fields.type')}
              value={values.type}
              options={typeOptions}
              onChange={(e) => updateField('type', e.target.value as AboutResourceType)}
              disabled={!canWrite}
            />
          )}
          <Select
            label={t('fields.locale')}
            value={values.locale}
            options={localeOptions}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.title')}
          name="title"
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={fieldErrors.title}
          required
          disabled={!canWrite}
        />

        <Textarea
          label={t('fields.description')}
          name="description"
          rows={3}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          disabled={!canWrite}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-atg-fg">{t('fields.file')}</p>
          {values.fileUrl.trim() ? (
            <div className="space-y-2 rounded-lg border border-atg-border bg-atg-surface/50 px-3 py-2">
              <p className="break-all text-sm text-atg-fg">{values.fileUrl}</p>
              {canWrite ? (
                <button
                  type="button"
                  onClick={() => updateField('fileUrl', '')}
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  {t('fields.removeFile')}
                </button>
              ) : null}
            </div>
          ) : null}
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
              >
                {uploadingFile ? tCommonForm('uploading') : tCommonForm('chooseFile')}
                <input
                  id={fileInputId}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => void handleFilePick(e)}
                  disabled={busy}
                />
              </label>
              <span className="text-xs text-atg-muted">{t('hints.fileFormat')}</span>
            </div>
          ) : null}
          <Input
            label={tCommonForm('externalUrlOptional')}
            name="fileUrl"
            type="url"
            value={values.fileUrl}
            onChange={(e) => updateField('fileUrl', e.target.value)}
            placeholder={tCommonForm('urlPlaceholder')}
            error={fieldErrors.fileUrl}
            disabled={!canWrite}
          />
          <Input
            label={t('fields.externalUrl')}
            name="externalUrl"
            type="url"
            value={values.externalUrl}
            onChange={(e) => updateField('externalUrl', e.target.value)}
            hint={t('hints.externalUrl')}
            error={fieldErrors.externalUrl}
            disabled={!canWrite}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={tCommon('columns.status')}
            value={values.status}
            options={statusOptions}
            onChange={(e) => updateField('status', e.target.value as AboutResourceStatus)}
            disabled={!canWrite}
          />
          <Input
            label={t('fields.sortOrder')}
            name="sortOrder"
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => updateField('sortOrder', e.target.value)}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.publishedAtOptional')}
          name="publishedAt"
          type="datetime-local"
          value={values.publishedAt}
          onChange={(e) => updateField('publishedAt', e.target.value)}
          hint={t('hints.publishedAt')}
          disabled={!canWrite}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          {canWrite ? (
            <Button type="submit" loading={submitting} loadingText={t('saving')} disabled={busy}>
              {mode === 'create' ? t('createButton') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" href={cancelHref}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
