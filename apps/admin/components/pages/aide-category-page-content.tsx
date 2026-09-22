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

      <div className="mx-auto w-full max-w-5xl space-y-8 sm:space-y-12">
        <header className="max-w-2xl space-y-6">
          <p>
            <Link
              href={adminHelpHref()}
              className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
            >
              ← {tUi('backToHub')}
            </Link>
          </p>

          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary sm:h-12 sm:w-12">
              <AdminHelpTopicIcon
                icon={category.icon}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
            </span>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
                {categoryTitle}
              </h1>
              <p className="mt-2 break-words text-base text-atg-muted sm:text-lg">
                {t(`categories.${category.slug}.description`)}
              </p>
              <p className="mt-2 text-xs font-medium text-atg-muted">
                {tUi('articlesInCategory', { count: articles.length })}
              </p>
            </div>
          </div>

          <AdminHelpSearch />
        </header>

        <AdminHelpArticleList categorySlug={category.slug} />
      </div>
    </div>
  );
}
