'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type { BlogPost, BlogPostStatus, CreateBlogPostRequest } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { isValidSlug, slugifyName } from '../../lib/slug';

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
    if (!values.content.trim()) {
      errors.content = t('validation.contentRequired');
    }
    const coverUrl = values.coverImageUrl.trim();
    if (coverUrl) {
      try {
        const parsed = new URL(coverUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.coverImageUrl = t('validation.coverUrlInvalid');
        }
      } catch {
        errors.coverImageUrl = t('validation.coverUrlInvalid');
      }
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

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.content')}
        </label>
        <textarea
          id="content"
          name="content"
          rows={14}
          value={values.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder={t('fields.contentPlaceholder')}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 font-mono text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          aria-invalid={Boolean(fieldErrors.content)}
        />
        {fieldErrors.content ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.content}</p>
        ) : (
          <p className="mt-1 text-xs text-atg-muted">{t('hints.contentHtml')}</p>
        )}
      </div>

      <Input
        label={t('fields.coverImageUrl')}
        name="coverImageUrl"
        type="url"
        value={values.coverImageUrl}
        onChange={(e) => updateField('coverImageUrl', e.target.value)}
        placeholder={tCommon('form.urlPlaceholder')}
        error={fieldErrors.coverImageUrl}
      />

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
        <Button type="submit" loading={submitting} loadingText={t('saving')}>
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/blog">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
