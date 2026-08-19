'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input, Textarea } from '@africatourismgate/ui';
import type { BlogPost, BlogPostStatus, CreateBlogPostRequest } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { isValidSlug, slugifyName } from '../../lib/slug';
import { RichTextEditor } from '../rich-text-editor';

const BLOG_COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_BLOG_COVER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type BlogPostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  status: BlogPostStatus;
  publishedAt: string;
  locale: string;
};

const defaultValues: BlogPostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  status: 'draft',
  publishedAt: '',
  locale: 'fr',
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function blogPostToFormValues(post: BlogPost): BlogPostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? '',
    status: post.status,
    publishedAt: toDatetimeLocalValue(post.publishedAt),
    locale: post.locale,
  };
}

function toPayload(values: BlogPostFormValues): CreateBlogPostRequest {
  const publishedAt = values.publishedAt.trim();
  return {
    title: values.title.trim(),
    slug: values.slug.trim().toLowerCase(),
    excerpt: values.excerpt.trim() || null,
    content: values.content.trim(),
    coverImageUrl: values.coverImageUrl.trim() || null,
    status: values.status,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    locale: values.locale,
  };
}

type BlogPostFormProps = {
  mode: 'create' | 'edit';
  postId?: string;
  initialPost?: BlogPost;
};

export function BlogPostForm({ mode, postId, initialPost }: BlogPostFormProps) {
  const { blog: getBlogErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.blog.form');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.blog.locale');
  const router = useRouter();
  const statusId = useId();
  const localeId = useId();
  const [values, setValues] = useState<BlogPostFormValues>(() =>
    initialPost ? blogPostToFormValues(initialPost) : defaultValues,
  );
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BlogPostFormValues, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputId = useId();

  const updateField = useCallback(
    <K extends keyof BlogPostFormValues>(key: K, value: BlogPostFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'title' && !slugTouched) {
          next.slug = slugifyName(String(value));
        }
        return next;
      });
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [slugTouched],
  );

  async function handleCoverImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_BLOG_COVER_IMAGE_TYPES.has(file.type)) {
        setFieldErrors((prev) => ({
          ...prev,
          coverImageUrl: tValidation('imageFormat'),
        }));
        return;
      }
      if (file.size > BLOG_COVER_IMAGE_MAX_BYTES) {
        setFieldErrors((prev) => ({
          ...prev,
          coverImageUrl: tValidation('imageTooLarge'),
        }));
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
      const response = await fetch(`${resolveApiBaseUrl()}/blog-posts/upload-cover`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body,
      });
      if (!response.ok) {
        throw new Error('Upload blog cover failed');
      }
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Invalid upload response');
      }
      updateField('coverImageUrl', payload.url);
    } catch {
      setFieldErrors((prev) => ({
        ...prev,
        coverImageUrl: tValidation('uploadFailed'),
      }));
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof BlogPostFormValues, string>> = {};
    if (!values.title.trim()) {
      errors.title = tCommon('validation.titleRequired');
    }
    const slug = values.slug.trim().toLowerCase();
    if (!slug) {
      errors.slug = tCommon('validation.slugRequired');
    } else if (!isValidSlug(slug)) {
      errors.slug = tCommon('validation.slugInvalidLong');
    }
    if (isRichTextEmpty(values.content)) {
      errors.content = t('validation.contentRequired');
    }
    const coverUrl = values.coverImageUrl.trim();
    if (coverUrl && !isValidCoverImageUrl(coverUrl)) {
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
        const created = await client.createBlogPost(payload);
        router.push(`/contenu/blog/${created.id}`);
        router.refresh();
      } else if (postId) {
        await client.updateBlogPost(postId, payload);
        router.push('/contenu/blog');
        router.refresh();
      }
    } catch (error) {
      setFormError(getBlogErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
        <p>{t('info.slugUnique')}</p>
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

      <Input
        label={t('fields.title')}
        name="title"
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={fieldErrors.title}
        required
      />

      <Input
        label={tCommon('columns.slug')}
        name="slug"
        value={values.slug}
        onChange={(e) => {
          setSlugTouched(true);
          updateField('slug', e.target.value);
        }}
        error={fieldErrors.slug}
        required
      />

      <Textarea
        id="excerpt"
        name="excerpt"
        label={t('fields.excerpt')}
        rows={3}
        value={values.excerpt}
        onChange={(e) => updateField('excerpt', e.target.value)}
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
            onChange={(e) => updateField('status', e.target.value as BlogPostStatus)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="draft">{t('status.draft')}</option>
            <option value="published">{t('status.published')}</option>
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
        <Button type="button" variant="outline" href="/contenu/blog">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}

function isValidCoverImageUrl(url: string): boolean {
  if (url.startsWith('/api/uploads/') || url.startsWith('/uploads/')) {
    return true;
  }
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
