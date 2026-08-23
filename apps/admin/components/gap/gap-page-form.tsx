'use client';

import { Button, Input, Select, Textarea } from '@africatourismgate/ui';
import type {
  CreateGapPageRequest,
  GapPage,
  GapPageSectionKey,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import { isValidMediaUrl, toDatetimeLocalValue } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { GAP_PAGE_SECTION_KEYS } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { RichTextEditor } from '../rich-text-editor';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PAGE_IMAGES = 10;

export type GapPageFormValues = {
  sectionKey: GapPageSectionKey;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrls: string[];
  status: GapStatus;
  publishedAt: string;
  locale: string;
};

const defaultValues: GapPageFormValues = {
  sectionKey: 'about',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrls: [],
  status: 'draft',
  publishedAt: '',
  locale: 'fr',
};

function resolvePageCoverImageUrls(page: GapPage): string[] {
  const fromArray = Array.isArray(page.coverImageUrls) ? page.coverImageUrls : [];
  if (fromArray.length > 0) {
    return Array.from(new Set(fromArray.map((url) => url.trim()).filter(Boolean))).slice(
      0,
      MAX_PAGE_IMAGES,
    );
  }
  return page.coverImageUrl?.trim() ? [page.coverImageUrl.trim()] : [];
}

function gapPageToFormValues(page: GapPage): GapPageFormValues {
  return {
    sectionKey: page.sectionKey,
    title: page.title,
    excerpt: page.excerpt ?? '',
    content: page.content,
    coverImageUrls: resolvePageCoverImageUrls(page),
    status: page.status,
    publishedAt: toDatetimeLocalValue(page.publishedAt),
    locale: page.locale,
  };
}

function toPayload(values: GapPageFormValues): CreateGapPageRequest {
  const publishedAt = values.publishedAt.trim();
  const coverImageUrls = Array.from(
    new Set(values.coverImageUrls.map((url) => url.trim()).filter(Boolean)),
  ).slice(0, MAX_PAGE_IMAGES);
  return {
    sectionKey: values.sectionKey,
    title: values.title.trim(),
    excerpt: values.excerpt.trim() || null,
    content: values.content.trim(),
    coverImageUrls,
    coverImageUrl: coverImageUrls[0] ?? null,
    status: values.status,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    locale: values.locale,
  };
}

type GapPageFormProps = {
  mode: 'create' | 'edit';
  pageId?: string;
  initialPage?: GapPage;
};

export function GapPageForm({ mode, pageId, initialPage }: GapPageFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.pages.form');
  const tSections = useTranslations('modules.gap.sections');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();
  const coverInputId = useId();
  const externalImageId = useId();

  const sectionOptions = useMemo(
    () => GAP_PAGE_SECTION_KEYS.map((key) => ({ value: key, label: tSections(key) })),
    [tSections],
  );
  const statusOptions = useMemo(
    () => [
      { value: 'draft', label: tStatus('draft') },
      { value: 'published', label: tStatus('published') },
    ],
    [tStatus],
  );
  const localeOptions = useMemo(
    () => [
      { value: 'fr', label: tLocale('fr') },
      { value: 'en', label: tLocale('en') },
      { value: 'es', label: tLocale('es') },
    ],
    [tLocale],
  );
  const [values, setValues] = useState<GapPageFormValues>(() =>
    initialPage ? gapPageToFormValues(initialPage) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GapPageFormValues | 'coverImageUrl', string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState('');

  const updateField = useCallback(
    <K extends keyof GapPageFormValues>(key: K, value: GapPageFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined, coverImageUrl: undefined }));
    },
    [],
  );

  const addCoverImageUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setValues((prev) => {
      if (prev.coverImageUrls.includes(trimmed) || prev.coverImageUrls.length >= MAX_PAGE_IMAGES) {
        return prev;
      }
      return { ...prev, coverImageUrls: [...prev.coverImageUrls, trimmed] };
    });
    setFieldErrors((prev) => ({ ...prev, coverImageUrl: undefined }));
  }, []);

  const removeCoverImageUrl = useCallback((url: string) => {
    setValues((prev) => ({
      ...prev,
      coverImageUrls: prev.coverImageUrls.filter((item) => item !== url),
    }));
  }, []);

  async function handleCoverPick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_PAGE_IMAGES - values.coverImageUrls.length;
    if (remaining <= 0) {
      setFieldErrors((prev) => ({ ...prev, coverImageUrl: t('validation.maxImages') }));
      event.target.value = '';
      return;
    }

    const session = getSession();
    if (!session?.accessToken) {
      setFieldErrors((prev) => ({
        ...prev,
        coverImageUrl: tValidation('sessionExpiredRetry'),
      }));
      event.target.value = '';
      return;
    }

    setUploadingCover(true);
    try {
      for (const file of files.slice(0, remaining)) {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          setFieldErrors((prev) => ({ ...prev, coverImageUrl: tValidation('imageFormat') }));
          continue;
        }
        if (file.size > IMAGE_MAX_BYTES) {
          setFieldErrors((prev) => ({ ...prev, coverImageUrl: tValidation('imageTooLarge') }));
          continue;
        }
        const body = new FormData();
        body.append('file', file);
        const response = await fetch(`${resolveApiBaseUrl()}/gap-pages/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body,
        });
        if (!response.ok) throw new Error('Upload failed');
        const payload = (await response.json()) as { url?: string };
        if (!payload.url) throw new Error('Invalid upload response');
        addCoverImageUrl(payload.url);
      }
    } catch {
      setFieldErrors((prev) => ({ ...prev, coverImageUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  }

  function handleAddExternalImage() {
    const url = externalImageUrl.trim();
    if (!url) return;
    if (!isValidMediaUrl(url)) {
      setFieldErrors((prev) => ({ ...prev, coverImageUrl: t('validation.coverUrlInvalid') }));
      return;
    }
    if (values.coverImageUrls.length >= MAX_PAGE_IMAGES) {
      setFieldErrors((prev) => ({ ...prev, coverImageUrl: t('validation.maxImages') }));
      return;
    }
    addCoverImageUrl(url);
    setExternalImageUrl('');
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof GapPageFormValues | 'coverImageUrl', string>> = {};
    if (!values.title.trim()) {
      errors.title = tCommon('validation.titleRequired');
    }
    if (isRichTextEmpty(values.content)) {
      errors.content = t('validation.contentRequired');
    }
    if (values.coverImageUrls.length > MAX_PAGE_IMAGES) {
      errors.coverImageUrl = t('validation.maxImages');
    }
    for (const url of values.coverImageUrls) {
      if (!isValidMediaUrl(url)) {
        errors.coverImageUrl = t('validation.coverUrlInvalid');
        break;
      }
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
        const created = await client.createGapPage(payload);
        router.push(`/gap/pages/${created.id}`);
        router.refresh();
      } else if (pageId) {
        await client.updateGapPage(pageId, payload);
        router.push('/gap/pages');
        router.refresh();
      }
    } catch (error) {
      setFormError(getGapErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || uploadingCover;
  const canAddMore = values.coverImageUrls.length < MAX_PAGE_IMAGES;

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
        {mode === 'edit' ? (
          <>
            <p className="mb-2 block text-sm font-medium text-atg-fg">{t('fields.section')}</p>
            <p className="text-sm text-atg-muted">{tSections(values.sectionKey)}</p>
          </>
        ) : (
          <Select
            label={t('fields.section')}
            value={values.sectionKey}
            options={sectionOptions}
            onChange={(e) => updateField('sectionKey', e.target.value as GapPageSectionKey)}
            disabled={!canWrite}
          />
        )}
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
        id="excerpt"
        name="excerpt"
        label={t('fields.excerpt')}
        rows={3}
        value={values.excerpt}
        onChange={(e) => updateField('excerpt', e.target.value)}
        disabled={!canWrite}
        placeholder={t('fields.excerptPlaceholder')}
      />

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
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-atg-fg">{t('fields.images')}</p>
          <p className="text-xs text-atg-muted">
            {t('fields.imagesCount', {
              count: values.coverImageUrls.length,
              max: MAX_PAGE_IMAGES,
            })}
          </p>
        </div>

        {canWrite && canAddMore ? (
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={coverInputId}
              className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
            >
              {uploadingCover ? tCommonForm('uploading') : tCommonForm('chooseFile')}
              <input
                id={coverInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => void handleCoverPick(e)}
                disabled={busy}
              />
            </label>
            <span className="text-xs text-atg-muted">{tCommonForm('imageFormatHint')}</span>
          </div>
        ) : null}

        {values.coverImageUrls.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {values.coverImageUrls.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="overflow-hidden rounded-lg border border-atg-border bg-atg-elevated"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={resolveMediaUrl(url)}
                    alt={t('fields.coverPreviewAlt')}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-atg-border px-2 py-1.5">
                  <span className="text-[11px] text-atg-muted">
                    {index === 0 ? t('fields.coverBadge') : `#${index + 1}`}
                  </span>
                  {canWrite ? (
                    <button
                      type="button"
                      onClick={() => removeCoverImageUrl(url)}
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      {t('fields.removeImage')}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-atg-muted">{t('fields.imagesEmpty')}</p>
        )}

        {canWrite && canAddMore ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                id={externalImageId}
                label={tCommonForm('externalUrlOptional')}
                type="url"
                value={externalImageUrl}
                onChange={(e) => setExternalImageUrl(e.target.value)}
                placeholder={tCommonForm('urlPlaceholder')}
                disabled={busy}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddExternalImage}
              disabled={busy || !externalImageUrl.trim()}
            >
              {t('fields.addImageUrl')}
            </Button>
          </div>
        ) : null}

        {fieldErrors.coverImageUrl ? (
          <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.coverImageUrl}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={tCommon('columns.status')}
          value={values.status}
          options={statusOptions}
          onChange={(e) => updateField('status', e.target.value as GapStatus)}
          disabled={!canWrite}
        />
        <Select
          label={t('fields.locale')}
          value={values.locale}
          options={localeOptions}
          onChange={(e) => updateField('locale', e.target.value)}
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

      {canWrite ? (
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" loading={submitting} loadingText={t('saving')} disabled={busy}>
            {mode === 'create' ? t('createButton') : t('saveButton')}
          </Button>
          <Button type="button" variant="outline" href="/gap/pages">
            {t('cancelButton')}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
