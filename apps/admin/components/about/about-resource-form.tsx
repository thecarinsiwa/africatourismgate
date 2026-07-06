'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  AboutResource,
  AboutResourceStatus,
  AboutResourceType,
  CreateAboutResourceRequest,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { ABOUT_RESOURCE_TYPES } from '../../lib/about/constants';
import { isValidMediaUrl, toDatetimeLocalValue } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';

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
};

export function AboutResourceForm({
  mode,
  resourceId,
  initialResource,
}: AboutResourceFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.resources.form');
  const tTypes = useTranslations('modules.about.resourceTypes');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();
  const typeId = useId();
  const statusId = useId();
  const localeId = useId();
  const [values, setValues] = useState<AboutResourceFormValues>(() =>
    initialResource ? resourceToFormValues(initialResource) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AboutResourceFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputId = useId();

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
        router.push('/contenu/a-propos/ressources');
        router.refresh();
      }
    } catch (error) {
      setFormError(getAboutErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={typeId} className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.type')}
        </label>
        <select
          id={typeId}
          value={values.type}
          onChange={(e) => updateField('type', e.target.value as AboutResourceType)}
          disabled={mode === 'edit'}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
        >
          {ABOUT_RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {tTypes(type)}
            </option>
          ))}
        </select>
      </div>

      <Input
        label={t('fields.title')}
        name="title"
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={fieldErrors.title}
        required
      />

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.description')}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-atg-fg">{t('fields.file')}</p>
        <label
          htmlFor={fileInputId}
          className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
        >
          {uploadingFile ? tCommonForm('uploading') : tCommonForm('chooseFile')}
          <input
            id={fileInputId}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleFilePick(e)}
            disabled={uploadingFile || submitting}
          />
        </label>
        <span className="block text-xs text-atg-muted">{t('hints.fileFormat')}</span>
        <Input
          label={tCommonForm('externalUrlOptional')}
          name="fileUrl"
          type="url"
          value={values.fileUrl}
          onChange={(e) => updateField('fileUrl', e.target.value)}
          error={fieldErrors.fileUrl}
        />
        <Input
          label={t('fields.externalUrl')}
          name="externalUrl"
          type="url"
          value={values.externalUrl}
          onChange={(e) => updateField('externalUrl', e.target.value)}
          hint={t('hints.externalUrl')}
          error={fieldErrors.externalUrl}
        />
      </div>

      <Input
        label={t('fields.sortOrder')}
        name="sortOrder"
        type="number"
        min={0}
        value={values.sortOrder}
        onChange={(e) => updateField('sortOrder', e.target.value)}
      />

      <Input
        label={t('fields.publishedAtOptional')}
        name="publishedAt"
        type="datetime-local"
        value={values.publishedAt}
        onChange={(e) => updateField('publishedAt', e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as AboutResourceStatus)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>
        <div>
          <label htmlFor={localeId} className="mb-2 block text-sm font-medium text-atg-fg">
            {t('fields.locale')}
          </label>
          <select
            id={localeId}
            value={values.locale}
            onChange={(e) => updateField('locale', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={t('saving')} disabled={uploadingFile}>
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/a-propos/ressources">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
