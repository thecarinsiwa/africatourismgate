'use client';

import { useEffect, useState } from 'react';
import type { AboutPageSectionKey } from '@africatourismgate/types';
import type { PublicAboutPage } from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { getAboutPageBySectionKeyForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from '../home/use-scroll-animation';

type AboutTextPageContentProps = {
  sectionKey: AboutPageSectionKey;
};

export function AboutTextPageContent({ sectionKey }: AboutTextPageContentProps) {
  const locale = useAppLocale();
  const t = useTranslations();
  const a = t.about;
  const { ref, isVisible } = useScrollAnimation(0.08);

  const [page, setPage] = useState<PublicAboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localeFallback, setLocaleFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setLocaleFallback(false);

    void getAboutPageBySectionKeyForLocale(sectionKey, locale)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={a.loading} showLabel />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
        <p className="font-medium text-atg-fg">{a.emptyPage}</p>
        <p className="mt-2 text-sm text-atg-muted">{a.emptyPageHint}</p>
      </div>
    );
  }

  return (
    <article
      ref={ref}
      className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {localeFallback ? (
        <p className="mb-6 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {a.localeFallback}
        </p>
      ) : null}

      {page.excerpt ? (
        <p className="mb-6 text-lg leading-relaxed text-atg-muted">{page.excerpt}</p>
      ) : null}

      {page.coverImageUrl ? (
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
  );
}
