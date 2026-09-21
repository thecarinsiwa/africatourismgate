'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getAdminHelpArticleBySlug,
  getAdminHelpCategoryBySlug,
} from '../../lib/admin-help/help-catalog';
import { adminHelpCategoryPath } from '../../lib/admin-help/routes';
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

      <article className="mx-auto w-full max-w-3xl space-y-8">
        <AdminHelpSearch />

        <header>
          <p className="text-sm font-medium text-primary">
            <Link
              href={adminHelpCategoryPath(category.slug)}
              className="outline-none hover:underline focus-visible:underline"
            >
              {categoryTitle}
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
            {articleTitle}
          </h1>
          {summary ? (
            <p className="mt-3 text-base text-atg-muted">{summary}</p>
          ) : null}
        </header>

        <AdminHelpArticleBody article={article} />

        <p>
          <Link
            href={adminHelpCategoryPath(category.slug)}
            className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
          >
            ← {tUi('backToCategory')}
          </Link>
        </p>
      </article>
    </div>
  );
}
