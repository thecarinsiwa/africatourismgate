'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getHelpCategories } from '../../lib/support/help-catalog';
import { supportCategoryPath } from '../../lib/support/routes';
import { HelpTopicIcon } from './support-help-icons';

export function SupportCategoryGrid() {
  const t = useTranslations('support');
  const categories = getHelpCategories();

  return (
    <section aria-labelledby="support-categories-heading">
      <h2
        id="support-categories-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {t('categoriesTitle')}
      </h2>
      <p className="mt-1 text-sm text-atg-muted">{t('categoriesSubtitle')}</p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={supportCategoryPath(category.slug)}
              className="group flex h-full gap-3 rounded-lg border border-atg-border p-4 outline-none transition-colors hover:border-primary hover:bg-atg-elevated focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary dark:border-atg-border dark:hover:bg-atg-elevated"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
                <HelpTopicIcon icon={category.icon} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-atg-fg group-hover:text-primary">
                  {t(`help.categories.${category.slug}.title`)}
                </span>
                <span className="mt-1 block text-sm text-atg-muted">
                  {t(`help.categories.${category.slug}.description`)}
                </span>
                <span className="mt-2 block text-xs font-medium text-atg-muted">
                  {t('articlesInCategory', {
                    count: category.articleSlugs.length,
                  })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
