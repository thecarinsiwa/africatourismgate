'use client';

import { useTranslations } from 'next-intl';
import { AdminListPageHeader } from './admin-list-page-header';

type TresorerieStubPageContentProps = {
  routePath: string;
};

/**
 * Shell TRESO-009 — pages stub en attendant CRUD (TRESO-013+).
 */
export function TresorerieStubPageContent({
  routePath,
}: TresorerieStubPageContentProps) {
  const t = useTranslations('pages.tresorerie');

  return (
    <div className="min-w-0 space-y-6">
      <AdminListPageHeader routePath={routePath} />
      <div
        className="rounded-lg border border-atg-border bg-atg-surface px-4 py-6 text-sm text-atg-muted"
        role="status"
      >
        <p className="font-medium text-atg-fg">{t('stub.title')}</p>
        <p className="mt-2">{t('stub.message')}</p>
      </div>
    </div>
  );
}
