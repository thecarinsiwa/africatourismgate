'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getAdminHelpQuickStartArticles } from '../../lib/admin-help/help-catalog';
import { adminHelpArticlePath } from '../../lib/admin-help/routes';

export function AdminHelpQuickStart() {
  const t = useTranslations('modules.adminHelp');
  const tUi = useTranslations('modules.adminHelp.ui');
  const articles = getAdminHelpQuickStartArticles();

  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      id="admin-help-quick-start"
      aria-labelledby="admin-help-quick-start-heading"
      className="scroll-mt-24"
    >
      <h2
        id="admin-help-quick-start-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {tUi('quickStartTitle')}
      </h2>
      <p className="mt-1 text-sm text-atg-muted">{tUi('quickStartSubtitle')}</p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={adminHelpArticlePath(article.categorySlug, article.slug)}
              className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-atg-border px-4 py-3 text-sm font-medium text-atg-fg outline-none transition-colors hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary dark:border-atg-border"
            >
              <span className="min-w-0 break-words">
                {t(`articles.${article.slug}.title`)}
              </span>
              <span aria-hidden className="shrink-0 text-atg-muted">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
