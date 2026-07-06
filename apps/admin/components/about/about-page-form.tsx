'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  AboutPage,
  AboutPageSectionKey,
  AboutPageStatus,
  CreateAboutPageRequest,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { ABOUT_PAGE_SECTION_KEYS } from '../../lib/about/constants';
import { isValidMediaUrl, toDatetimeLocalValue } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { RichTextEditor } from '../rich-text-editor';

const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type AboutPageFormValues = {
  sectionKey: AboutPageSectionKey;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  status: AboutPageStatus;
  publishedAt: string;
  locale: string;
};

const defaultValues: AboutPageFormValues = {
  sectionKey: 'who-we-are',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  status: 'draft',
  publishedAt: '',
  locale: 'fr',
};

function aboutPageToFormValues(page: AboutPage): AboutPageFormValues {
  return {
    sectionKey: page.sectionKey,
    title: page.title,
    excerpt: page.excerpt ?? '',
    content: page.content,
    coverImageUrl: page.coverImageUrl ?? '',
    status: page.status,
    publishedAt: toDatetimeLocalValue(page.publishedAt),
    locale: page.locale,
  };
}

function toPayload(values: AboutPageFormValues): CreateAboutPageRequest {
  const publishedAt = values.publishedAt.trim();
  return {
    sectionKey: values.sectionKey,
    title: values.title.trim(),
    excerpt: values.excerpt.trim() || null,
    content: values.content.trim(),
    coverImageUrl: values.coverImageUrl.trim() || null,
    status: values.status,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    locale: values.locale,
  };
}

type AboutPageFormProps = {
  mode: 'create' | 'edit';
  pageId?: string;
  initialPage?: AboutPage;
};

export function AboutPageForm({ mode, pageId, initialPage }: AboutPageFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.pages.form');
  const tSections = useTranslations('modules.about.sections');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();
  const statusId = useId();
  const localeId = useId();
  const sectionId = useId();
  const [values, setValues] = useState<AboutPageFormValues>(() =>
    initialPage ? aboutPageToFormValues(initialPage) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AboutPageFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputId = useId();

  const updateField = useCallback(
    <K extends keyof AboutPageFormValues>(key: K, value: AboutPageFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  async function handleCoverImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_COVER_IMAGE_TYPES.has(file.type)) {
        setFieldErrors((prev) => ({ ...prev, coverImageUrl: tValidation('imageFormat') }));
        return;
      }
      if (file.size > COVER_IMAGE_MAX_BYTES) {
        setFieldErrors((prev) => ({ ...prev, coverImageUrl: tValidation('imageTooLarge') }));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFieldErrors((prev) => ({
          ...prev,
          coverImageUrl: tValidation('sessionExpiredRetry'),
        }));
        return;
      }
      setUploadingCover(true);
      setFieldErrors((prev) => ({ ...prev, coverImageUrl: undefined }));
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/about-pages/upload-cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      updateField('coverImageUrl', payload.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, coverImageUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof AboutPageFormValues, string>> = {};
    if (!values.title.trim()) {
      errors.title = tCommon('validation.titleRequired');
    }
    if (isRichTextEmpty(values.content)) {
      errors.content = t('validation.contentRequired');
    }
    const coverUrl = values.coverImageUrl.trim();
    if (coverUrl && !isValidMediaUrl(coverUrl)) {
      errors.coverImageUrl = t('validation.coverUrlInvalid');
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
        const created = await client.createAboutPage(payload);
        router.push(`/contenu/a-propos/pages/${created.id}`);
        router.refresh();
      } else if (pageId) {
        await client.updateAboutPage(pageId, payload);
        router.push('/contenu/a-propos/pages');
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
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
        <p>{t('info.sectionLocaleUnique')}</p>
        <p className="mt-2">{t('info.publishedAtHint')}</p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={sectionId} className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.section')}
        </label>
        {mode === 'edit' ? (
          <p className="text-sm text-atg-muted">{tSections(values.sectionKey)}</p>
        ) : (
          <select
            id={sectionId}
            value={values.sectionKey}
            onChange={(e) => updateField('sectionKey', e.target.value as AboutPageSectionKey)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {ABOUT_PAGE_SECTION_KEYS.map((key) => (
              <option key={key} value={key}>
                {tSections(key)}
              </option>
            ))}
          </select>
        )}
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
          placeholder={t('fields.excerptPlaceholder')}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <RichTextEditor
        label={t('fields.content')}
        value={values.content}
        onChange={(html) => updateField('content', html)}
        placeholder={t('fields.contentPlaceholder')}
        contentClassName="min-h-[280px]"
      />
      {fieldErrors.content ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.content}</p>
      ) : null}

      <div className="space-y-3">
        <p className="text-sm font-medium text-atg-fg">{t('fields.coverImageUrl')}</p>
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor={coverFileInputId}
            className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
          >
            {uploadingCover ? tCommonForm('uploading') : tCommonForm('chooseFile')}
            <input
              id={coverFileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleCoverImagePick(e)}
              disabled={uploadingCover || submitting}
            />
          </label>
          <span className="text-xs text-atg-muted">{tCommonForm('imageFormatHint')}</span>
        </div>
        {values.coverImageUrl.trim() ? (
          <Image
            src={resolveMediaUrl(values.coverImageUrl.trim())}
            alt={t('fields.coverPreviewAlt')}
            width={640}
            height={360}
            unoptimized
            className="h-44 w-full max-w-xl rounded-lg border border-atg-border object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <Input
          label={tCommonForm('externalUrlOptional')}
          name="coverImageUrl"
          type="url"
          value={values.coverImageUrl}
          onChange={(e) => updateField('coverImageUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          error={fieldErrors.coverImageUrl}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as AboutPageStatus)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
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
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      <Input
        label={t('fields.publishedAtOptional')}
        name="publishedAt"
        type="datetime-local"
        value={values.publishedAt}
        onChange={(e) => updateField('publishedAt', e.target.value)}
        hint={t('hints.publishedAt')}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={t('saving')} disabled={uploadingCover}>
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/a-propos/pages">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
