'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getAdminHelpArticlesByCategory,
  type AdminHelpCategorySlug,
} from '../../lib/admin-help/help-catalog';
import { adminHelpArticlePath } from '../../lib/admin-help/routes';

export type AdminHelpArticleListProps = {
  categorySlug: AdminHelpCategorySlug;
};

export function AdminHelpArticleList({
  categorySlug,
}: AdminHelpArticleListProps) {
  const t = useTranslations('modules.adminHelp');
  const articles = getAdminHelpArticlesByCategory(categorySlug);

  if (articles.length === 0) {
    return null;
  }

  return (
    <ul className="divide-y divide-atg-border border-y border-atg-border dark:divide-atg-border dark:border-atg-border">
      {articles.map((article) => {
        const summary = t(`articles.${article.slug}.summary`);
        return (
          <li key={article.id}>
            <Link
              href={adminHelpArticlePath(article.categorySlug, article.slug)}
              className="flex min-w-0 items-start justify-between gap-3 py-4 outline-none transition-colors hover:text-primary focus-visible:text-primary"
            >
              <span className="min-w-0">
                <span className="block break-words text-sm font-semibold text-atg-fg">
                  {t(`articles.${article.slug}.title`)}
                </span>
                {summary ? (
                  <span className="mt-1 block break-words text-sm text-atg-muted">
                    {summary}
                  </span>
                ) : null}
              </span>
              <span aria-hidden className="mt-0.5 shrink-0 text-atg-muted">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
