'use client';

import { useEffect, useState } from 'react';
import type { GapPageSectionKey } from '@africatourismgate/types';
import type { PublicGapPage } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { getGapPageBySectionKeyForLocale } from '@/lib/api/public-gap';

type GapPageContentProps = {
  sectionKey: GapPageSectionKey;
  title: string;
};

export function GapPageContent({ sectionKey, title }: GapPageContentProps) {
  const locale = useLocale();
  const t = useTranslations('common');
  const [page, setPage] = useState<PublicGapPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localeFallback, setLocaleFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setLocaleFallback(false);

    void getGapPageBySectionKeyForLocale(sectionKey, locale)
      .then((data) => {
        if (cancelled) return;
        setPage(data);
        if (data.locale !== locale) {
          setLocaleFallback(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPage(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sectionKey, locale]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-atg-fg sm:text-4xl">{title}</h1>
      </header>

      {loading ? <p className="text-sm text-atg-muted">{t('loading')}</p> : null}

      {error || (!loading && !page) ? (
        <div className="rounded-xl border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
          <p className="font-medium text-atg-fg">{t('empty')}</p>
          <p className="mt-2 text-sm text-atg-muted">{t('emptyHint')}</p>
        </div>
      ) : null}

      {page ? (
        <article>
          {localeFallback ? (
            <p className="mb-6 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              {t('localeFallback')}
            </p>
          ) : null}

          {page.excerpt ? (
            <p className="mb-6 text-lg leading-relaxed text-atg-muted">{page.excerpt}</p>
          ) : null}

          {page.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.coverImageUrl}
              alt=""
              className="mb-8 w-full rounded-xl object-cover"
            />
          ) : null}

          <div
            className="prose prose-neutral max-w-none dark:prose-invert prose-p:text-atg-muted prose-headings:text-atg-fg"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      ) : null}
    </div>
  );
}
