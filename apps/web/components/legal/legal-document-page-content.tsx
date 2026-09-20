'use client';

import { useEffect, useState } from 'react';
import type { LegalPageSectionKey, PublicLegalPage } from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { getLegalPageBySectionKeyForLocale } from '../../lib/api/public';
import { useScrollAnimation } from '../home/use-scroll-animation';
import { LegalShell } from './legal-shell';

type LegalDocumentPageContentProps = {
  sectionKey: LegalPageSectionKey;
  fallbackTitle: string;
  fallbackSubtitle: string;
};

export function LegalDocumentPageContent({
  sectionKey,
  fallbackTitle,
  fallbackSubtitle,
}: LegalDocumentPageContentProps) {
  const locale = useLocale();
  const t = useTranslations('legal');
  const { ref, isVisible } = useScrollAnimation(0.08);

  const [page, setPage] = useState<PublicLegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localeFallback, setLocaleFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setLocaleFallback(false);

    void getLegalPageBySectionKeyForLocale(sectionKey, locale)
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

  const heroTitle = page?.title ?? fallbackTitle;

  if (loading) {
    return (
      <LegalShell title={fallbackTitle} description={fallbackSubtitle}>
        <div className="flex items-center justify-center py-16">
          <Spinner size="md" variant="primary" label={t('loading')} showLabel />
        </div>
      </LegalShell>
    );
  }

  if (error || !page) {
    return (
      <LegalShell title={fallbackTitle} description={fallbackSubtitle}>
        <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
          <p className="font-medium text-atg-fg">{t('emptyPage')}</p>
          <p className="mt-2 text-sm text-atg-muted">{t('emptyPageHint')}</p>
        </div>
      </LegalShell>
    );
  }

  return (
    <LegalShell title={heroTitle} description={fallbackSubtitle}>
      <article
        ref={ref}
        className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {localeFallback ? (
          <p className="mb-6 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            {t('localeFallback')}
          </p>
        ) : null}

        <div
          className="prose prose-neutral max-w-none dark:prose-invert prose-p:text-atg-muted prose-headings:text-atg-fg prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </LegalShell>
  );
}
