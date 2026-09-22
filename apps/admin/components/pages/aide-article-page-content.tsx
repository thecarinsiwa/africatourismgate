'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getAdminHelpArticleBySlug,
  getAdminHelpCategoryBySlug,
} from '../../lib/admin-help/help-catalog';
import {
  adminHelpCategoryPath,
  adminHelpHref,
} from '../../lib/admin-help/routes';
import { AdminHelpArticleBody } from '../admin-help/admin-help-article-body';
import { AdminHelpBreadcrumbs } from '../admin-help/admin-help-breadcrumbs';
import { AdminHelpSearch } from '../admin-help/admin-help-search';

export type AideArticlePageContentProps = {
  categorySlug: string;
  articleSlug: string;
};

export function AideArticlePageContent({
  categorySlug,
  articleSlug,
}: AideArticlePageContentProps) {
  const t = useTranslations('modules.adminHelp');
  const tUi = useTranslations('modules.adminHelp.ui');
  const article = getAdminHelpArticleBySlug(articleSlug);
  const category = getAdminHelpCategoryBySlug(categorySlug);

  if (!article || !category || article.categorySlug !== categorySlug) {
    return null;
  }

  const categoryTitle = t(`categories.${category.slug}.title`);
  const articleTitle = t(`articles.${article.slug}.title`);
  const summary = t(`articles.${article.slug}.summary`);

  return (
    <div className="min-w-0">
      <AdminHelpBreadcrumbs
        categorySlug={category.slug}
        articleSlug={article.slug}
      />

      <article className="mx-auto w-full max-w-5xl space-y-8 sm:space-y-12">
        <header className="max-w-2xl space-y-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Link
              href={adminHelpCategoryPath(category.slug)}
              className="font-medium text-primary outline-none hover:underline focus-visible:underline"
            >
              ← {tUi('backToCategory')}
            </Link>
            <span aria-hidden className="text-atg-border">
              ·
            </span>
            <Link
              href={adminHelpHref()}
              className="font-medium text-atg-muted outline-none hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline"
            >
              {tUi('backToHub')}
            </Link>
          </p>

          <div>
            <p className="text-sm font-medium text-primary">
              <Link
                href={adminHelpCategoryPath(category.slug)}
                className="outline-none hover:underline focus-visible:underline"
              >
                {categoryTitle}
              </Link>
            </p>
            <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
              {articleTitle}
            </h1>
            {summary ? (
              <p className="mt-2 break-words text-base text-atg-muted sm:text-lg">
                {summary}
              </p>
            ) : null}
          </div>

          <AdminHelpSearch />
        </header>

        <div className="max-w-3xl">
          <AdminHelpArticleBody article={article} />
        </div>
      </article>
    </div>
  );
}
