'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  getArticleBySlug,
  getCategoryBySlug,
  getRelatedArticles,
} from '../../lib/support/help-catalog';
import {
  SUPPORT_BASE_PATH,
  supportArticlePath,
  supportCategoryPath,
} from '../../lib/support/routes';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { SupportBreadcrumbs } from './support-breadcrumbs';
import { SupportHelpRichText } from './support-help-rich-text';
import { SupportSearch } from './support-search';

type SupportArticlePageContentProps = {
  categorySlug: string;
  articleSlug: string;
};

export function SupportArticlePageContent({
  categorySlug,
  articleSlug,
}: SupportArticlePageContentProps) {
  const t = useTranslations('support');
  const article = getArticleBySlug(articleSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!article || !category || article.categorySlug !== categorySlug) {
    return null;
  }

  const related = getRelatedArticles(article);
  const categoryTitle = t(`help.categories.${category.slug}.title`);
  const articleTitle = t(`help.articles.${article.slug}.title`);
  const body = t(`help.articles.${article.slug}.body`);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <SupportBreadcrumbs
            items={[
              { label: t('breadcrumbHome'), href: SUPPORT_BASE_PATH },
              {
                label: categoryTitle,
                href: supportCategoryPath(category.slug),
              },
              { label: articleTitle },
            ]}
          />

          <div className="mb-8">
            <SupportSearch />
          </div>

          <header className="mb-8">
            <p className="text-sm font-medium text-primary">
              <Link
                href={supportCategoryPath(category.slug)}
                className="outline-none hover:underline focus-visible:underline"
              >
                {categoryTitle}
              </Link>
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
              {articleTitle}
            </h1>
            <p className="mt-3 text-base text-atg-muted">
              {t(`help.articles.${article.slug}.summary`)}
            </p>
          </header>

          <div className="space-y-4 text-base leading-relaxed text-atg-fg">
            {body.split(/\n\n+/).map((paragraph, index) => (
              <p key={index} className="m-0">
                <SupportHelpRichText text={paragraph} />
              </p>
            ))}
          </div>

          {related.length > 0 ? (
            <section
              aria-labelledby="support-related-heading"
              className="mt-12 border-t border-atg-border pt-8 dark:border-atg-border"
            >
              <h2
                id="support-related-heading"
                className="text-lg font-semibold text-atg-fg"
              >
                {t('relatedTitle')}
              </h2>
              <ul className="mt-4 divide-y divide-atg-border border-y border-atg-border dark:divide-atg-border dark:border-atg-border">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={supportArticlePath(item.categorySlug, item.slug)}
                      className="block py-3.5 text-sm font-medium text-atg-fg outline-none transition-colors hover:text-primary focus-visible:text-primary"
                    >
                      {t(`help.articles.${item.slug}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-8">
            <Link
              href={supportCategoryPath(category.slug)}
              className="text-sm font-medium text-primary outline-none hover:underline focus-visible:underline"
            >
              ← {t('backToCategory')}
            </Link>
          </p>
        </article>
      </main>
      <HomeFooter />
    </div>
  );
}
