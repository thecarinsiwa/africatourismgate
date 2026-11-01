'use client';

import type { PublicBlogComment } from '@africatourismgate/types';
import { Button, Input, Textarea } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';

type BlogCommentsProps = {
  comments: PublicBlogComment[];
  submitting?: boolean;
  error?: string | null;
  onSubmit: (input: {
    authorName: string;
    authorEmail?: string;
    body: string;
  }) => Promise<void>;
};

export function BlogComments({
  comments,
  submitting = false,
  error = null,
  onSubmit,
}: BlogCommentsProps) {
  const t = useTranslations('blog.engagement');
  const locale = useLocale();
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [body, setBody] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const name = authorName.trim();
    const text = body.trim();
    if (name.length < 2 || text.length < 3) {
      setFieldError(t('commentValidation'));
      return;
    }
    setFieldError(null);
    try {
      await onSubmit({
        authorName: name,
        authorEmail: authorEmail.trim() || undefined,
        body: text,
      });
      setBody('');
    } catch {
      // Parent sets error message; keep draft text.
    }
  }

  return (
    <section className="space-y-6" aria-label={t('commentsAria')}>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
          {t('commentsTitle')}
        </h2>
        <p className="mt-1 text-sm text-atg-muted">
          {t('commentsCount', { count: comments.length })}
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-atg-border bg-atg-elevated/40 p-4 sm:p-5">
        <Input
          label={t('commentName')}
          name="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          maxLength={120}
        />
        <Input
          label={t('commentEmail')}
          name="authorEmail"
          type="email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          hint={t('commentEmailHint')}
          maxLength={255}
        />
        <Textarea
          id="blog-comment-body"
          name="body"
          label={t('commentBody')}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('commentBodyPlaceholder')}
          required
          maxLength={2000}
        />
        {fieldError || error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {fieldError || error}
          </p>
        ) : null}
        <Button type="submit" loading={submitting} loadingText={t('commentSending')} className="w-full sm:w-auto">
          {t('commentSubmit')}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-atg-muted">{t('commentsEmpty')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-atg-fg">{comment.authorName}</p>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-atg-muted"
                >
                  {formatRelativeReviewDate(comment.createdAt, locale)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-atg-muted">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
