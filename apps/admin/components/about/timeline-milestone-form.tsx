'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  AboutTimelineMilestone,
  AboutTimelineMilestoneStatus,
  CreateAboutTimelineMilestoneRequest,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type TimelineMilestoneFormValues = {
  periodLabel: string;
  periodTitle: string;
  periodSortOrder: string;
  year: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: string;
  status: AboutTimelineMilestoneStatus;
  locale: string;
};

const defaultValues: TimelineMilestoneFormValues = {
  periodLabel: '',
  periodTitle: '',
  periodSortOrder: '0',
  year: String(new Date().getFullYear()),
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function milestoneToFormValues(milestone: AboutTimelineMilestone): TimelineMilestoneFormValues {
  return {
    periodLabel: milestone.periodLabel,
    periodTitle: milestone.periodTitle,
    periodSortOrder: String(milestone.periodSortOrder),
    year: String(milestone.year),
    title: milestone.title,
    excerpt: milestone.excerpt ?? '',
    content: milestone.content ?? '',
    imageUrl: milestone.imageUrl ?? '',
    linkUrl: milestone.linkUrl ?? '',
    sortOrder: String(milestone.sortOrder),
    status: milestone.status,
    locale: milestone.locale,
  };
}

function toPayload(values: TimelineMilestoneFormValues): CreateAboutTimelineMilestoneRequest {
  return {
    periodLabel: values.periodLabel.trim(),
    periodTitle: values.periodTitle.trim(),
    periodSortOrder: Number.parseInt(values.periodSortOrder, 10) || 0,
    year: Number.parseInt(values.year, 10) || new Date().getFullYear(),
    title: values.title.trim(),
    excerpt: values.excerpt.trim() || null,
    content: values.content.trim() || null,
    imageUrl: values.imageUrl.trim() || null,
    linkUrl: values.linkUrl.trim() || null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type TimelineMilestoneFormProps = {
  mode: 'create' | 'edit';
  milestoneId?: string;
  initialMilestone?: AboutTimelineMilestone;
};

export function TimelineMilestoneForm({
  mode,
  milestoneId,
  initialMilestone,
}: TimelineMilestoneFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.timeline.form');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();
  const statusId = useId();
  const localeId = useId();
  const [values, setValues] = useState<TimelineMilestoneFormValues>(() =>
    initialMilestone ? milestoneToFormValues(initialMilestone) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TimelineMilestoneFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputId = useId();

  const updateField = useCallback(
    <K extends keyof TimelineMilestoneFormValues>(key: K, value: TimelineMilestoneFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  async function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageFormat') }));
        return;
      }
      if (file.size > IMAGE_MAX_BYTES) {
        setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageTooLarge') }));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('sessionExpiredRetry') }));
        return;
      }
      setUploadingImage(true);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/about-timeline-milestones/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      updateField('imageUrl', payload.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof TimelineMilestoneFormValues, string>> = {};
    if (!values.periodLabel.trim()) errors.periodLabel = t('validation.periodLabelRequired');
    if (!values.periodTitle.trim()) errors.periodTitle = t('validation.periodTitleRequired');
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    const year = Number.parseInt(values.year, 10);
    if (!Number.isFinite(year) || year < 1800 || year > 2200) {
      errors.year = t('validation.yearInvalid');
    }
    const imageUrl = values.imageUrl.trim();
    if (imageUrl && !isValidMediaUrl(imageUrl)) {
      errors.imageUrl = t('validation.imageUrlInvalid');
    }
    const linkUrl = values.linkUrl.trim();
    if (linkUrl && !isValidMediaUrl(linkUrl)) {
      errors.linkUrl = t('validation.linkUrlInvalid');
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
        const created = await client.createAboutTimelineMilestone(payload);
        router.push(`/contenu/a-propos/timeline/${created.id}`);
        router.refresh();
      } else if (milestoneId) {
        await client.updateAboutTimelineMilestone(milestoneId, payload);
        router.push('/contenu/a-propos/timeline');
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('fields.periodLabel')}
          name="periodLabel"
          value={values.periodLabel}
          onChange={(e) => updateField('periodLabel', e.target.value)}
          error={fieldErrors.periodLabel}
          required
        />
        <Input
          label={t('fields.periodSortOrder')}
          name="periodSortOrder"
          type="number"
          min={0}
          value={values.periodSortOrder}
          onChange={(e) => updateField('periodSortOrder', e.target.value)}
        />
      </div>

      <Input
        label={t('fields.periodTitle')}
        name="periodTitle"
        value={values.periodTitle}
        onChange={(e) => updateField('periodTitle', e.target.value)}
        error={fieldErrors.periodTitle}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('fields.year')}
          name="year"
          type="number"
          min={1800}
          max={2200}
          value={values.year}
          onChange={(e) => updateField('year', e.target.value)}
          error={fieldErrors.year}
          required
        />
        <Input
          label={t('fields.sortOrder')}
          name="sortOrder"
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => updateField('sortOrder', e.target.value)}
        />
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
        <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.excerpt')}
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={values.excerpt}
          onChange={(e) => updateField('excerpt', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.content')}
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          value={values.content}
          onChange={(e) => updateField('content', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-atg-fg">{t('fields.image')}</p>
        <label
          htmlFor={imageFileInputId}
          className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
        >
          {uploadingImage ? tCommonForm('uploading') : tCommonForm('chooseFile')}
          <input
            id={imageFileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleImagePick(e)}
            disabled={uploadingImage || submitting}
          />
        </label>
        {values.imageUrl.trim() ? (
          <Image
            src={resolveMediaUrl(values.imageUrl.trim())}
            alt={t('fields.imagePreviewAlt')}
            width={320}
            height={180}
            unoptimized
            className="h-32 w-auto rounded-lg border border-atg-border object-cover"
          />
        ) : null}
        <Input
          label={tCommonForm('externalUrlOptional')}
          name="imageUrl"
          type="url"
          value={values.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          error={fieldErrors.imageUrl}
        />
      </div>

      <Input
        label={t('fields.linkUrl')}
        name="linkUrl"
        type="url"
        value={values.linkUrl}
        onChange={(e) => updateField('linkUrl', e.target.value)}
        error={fieldErrors.linkUrl}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as AboutTimelineMilestoneStatus)}
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
        <Button
          type="submit"
          loading={submitting}
          loadingText={t('saving')}
          disabled={uploadingImage}
        >
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/a-propos/timeline">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
