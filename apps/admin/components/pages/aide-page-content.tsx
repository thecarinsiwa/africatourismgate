'use client';

import { useTranslations } from 'next-intl';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminHelpCategoryGrid } from '../admin-help/admin-help-category-grid';
import { AdminHelpPopularList } from '../admin-help/admin-help-popular-list';
import { AdminHelpQuickStart } from '../admin-help/admin-help-quick-start';
import { AdminHelpSearch } from '../admin-help/admin-help-search';

export function AidePageContent() {
  const tUi = useTranslations('modules.adminHelp.ui');
  useSetAdminPageMeta({ title: tUi('pageTitle') });

  return (
    <div className="min-w-0">
      <div className="mx-auto w-full max-w-4xl space-y-8 sm:space-y-12">
        <header className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
              {tUi('pageTitle')}
            </h1>
            <p className="mt-2 text-base text-atg-muted sm:text-lg">
              {tUi('pageSubtitle')}
            </p>
          </div>
          <AdminHelpSearch />
        </header>

        <AdminHelpQuickStart />
        <AdminHelpCategoryGrid />
        <AdminHelpPopularList />
      </div>
    </div>
  );
}
