'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getAdminHelpPopularArticles } from '../../lib/admin-help/help-catalog';
import { adminHelpArticlePath } from '../../lib/admin-help/routes';

export function AdminHelpPopularList() {
  const t = useTranslations('modules.adminHelp');
  const tUi = useTranslations('modules.adminHelp.ui');
  const articles = getAdminHelpPopularArticles();

  return (
    <section aria-labelledby="admin-help-popular-heading">
      <h2
        id="admin-help-popular-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {tUi('popularTitle')}
      </h2>
      <p className="mt-1 text-sm text-atg-muted">{tUi('popularSubtitle')}</p>

      <ul className="mt-4 divide-y divide-atg-border border-y border-atg-border dark:divide-atg-border dark:border-atg-border">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={adminHelpArticlePath(article.categorySlug, article.slug)}
              className="flex min-w-0 items-start justify-between gap-4 py-3.5 outline-none transition-colors hover:text-primary focus-visible:text-primary"
            >
              <span className="min-w-0 break-words text-sm font-medium text-atg-fg">
                {t(`articles.${article.slug}.title`)}
              </span>
              <span aria-hidden className="mt-0.5 shrink-0 text-atg-muted">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
