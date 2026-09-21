'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getAdminHelpCategories } from '../../lib/admin-help/help-catalog';
import { adminHelpCategoryPath } from '../../lib/admin-help/routes';
import { AdminHelpTopicIcon } from './admin-help-icons';

export function AdminHelpCategoryGrid() {
  const t = useTranslations('modules.adminHelp');
  const tUi = useTranslations('modules.adminHelp.ui');
  const categories = getAdminHelpCategories();

  return (
    <section aria-labelledby="admin-help-categories-heading">
      <h2
        id="admin-help-categories-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {tUi('categoriesTitle')}
      </h2>
      <p className="mt-1 text-sm text-atg-muted">{tUi('categoriesSubtitle')}</p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={adminHelpCategoryPath(category.slug)}
              className="group flex h-full gap-3 rounded-lg border border-atg-border p-4 outline-none transition-colors hover:border-primary hover:bg-atg-elevated focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary dark:border-atg-border dark:hover:bg-atg-elevated"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
                <AdminHelpTopicIcon icon={category.icon} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-atg-fg group-hover:text-primary">
                  {t(`categories.${category.slug}.title`)}
                </span>
                <span className="mt-1 block text-sm text-atg-muted">
                  {t(`categories.${category.slug}.description`)}
                </span>
                <span className="mt-2 block text-xs font-medium text-atg-muted">
                  {tUi('articlesInCategory', {
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
