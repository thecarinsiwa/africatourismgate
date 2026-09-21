'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getArticlesByCategory,
  getCategoryBySlug,
  type HelpCategorySlug,
} from '../../lib/support/help-catalog';
import {
  SUPPORT_BASE_PATH,
  supportArticlePath,
} from '../../lib/support/routes';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { SupportBreadcrumbs } from './support-breadcrumbs';
import { HelpTopicIcon } from './support-help-icons';
import { SupportSearch } from './support-search';

type SupportCategoryPageContentProps = {
  categorySlug: HelpCategorySlug;
};

export function SupportCategoryPageContent({
  categorySlug,
}: SupportCategoryPageContentProps) {
  const t = useTranslations('support');
  const category = getCategoryBySlug(categorySlug);
  const articles = getArticlesByCategory(categorySlug);

  if (!category) {
    return null;
  }

  const categoryTitle = t(`help.categories.${category.slug}.title`);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <SupportBreadcrumbs
            items={[
              { label: t('breadcrumbHome'), href: SUPPORT_BASE_PATH },
              { label: categoryTitle },
            ]}
          />

          <header className="mb-8 flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center text-primary">
              <HelpTopicIcon icon={category.icon} className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
                {categoryTitle}
              </h1>
              <p className="mt-2 text-sm text-atg-muted">
                {t(`help.categories.${category.slug}.description`)}
              </p>
              <p className="mt-1 text-sm text-atg-muted">
                {t('articlesInCategory', { count: articles.length })}
              </p>
            </div>
          </header>

          <div className="mb-8">
            <SupportSearch />
          </div>

          <ul className="divide-y divide-atg-border border-y border-atg-border dark:divide-atg-border dark:border-atg-border">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={supportArticlePath(article.categorySlug, article.slug)}
                  className="block py-4 outline-none transition-colors hover:text-primary focus-visible:text-primary"
                >
                  <span className="block text-sm font-semibold text-atg-fg">
                    {t(`help.articles.${article.slug}.title`)}
                  </span>
                  <span className="mt-1 block text-sm text-atg-muted">
                    {t(`help.articles.${article.slug}.summary`)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8">
            <Link
              href={SUPPORT_BASE_PATH}
              className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
            >
              ← {t('backToHub')}
            </Link>
          </p>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
