'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getAdminHelpArticlesByCategory,
  getAdminHelpCategoryBySlug,
  type AdminHelpCategorySlug,
} from '../../lib/admin-help/help-catalog';
import { adminHelpHref } from '../../lib/admin-help/routes';
import { AdminHelpArticleList } from '../admin-help/admin-help-article-list';
import { AdminHelpBreadcrumbs } from '../admin-help/admin-help-breadcrumbs';
import { AdminHelpTopicIcon } from '../admin-help/admin-help-icons';
import { AdminHelpSearch } from '../admin-help/admin-help-search';

export type AideCategoryPageContentProps = {
  categorySlug: AdminHelpCategorySlug;
};

export function AideCategoryPageContent({
  categorySlug,
}: AideCategoryPageContentProps) {
  const t = useTranslations('modules.adminHelp');
  const tUi = useTranslations('modules.adminHelp.ui');
  const category = getAdminHelpCategoryBySlug(categorySlug);
  const articles = getAdminHelpArticlesByCategory(categorySlug);

  if (!category) {
    return null;
  }

  const categoryTitle = t(`categories.${category.slug}.title`);

  return (
    <div className="min-w-0">
      <AdminHelpBreadcrumbs categorySlug={category.slug} />

      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center text-primary">
            <AdminHelpTopicIcon icon={category.icon} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
              {categoryTitle}
            </h1>
            <p className="mt-2 text-sm text-atg-muted">
              {t(`categories.${category.slug}.description`)}
            </p>
            <p className="mt-1 text-sm text-atg-muted">
              {tUi('articlesInCategory', { count: articles.length })}
            </p>
          </div>
        </header>

        <AdminHelpSearch />

        <AdminHelpArticleList categorySlug={category.slug} />

        <p>
          <Link
            href={adminHelpHref()}
            className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
          >
            ← {tUi('backToHub')}
          </Link>
        </p>
      </div>
    </div>
  );
}
