'use client';

import { useTranslations } from 'next-intl';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminHelpCategoryGrid } from '../admin-help/admin-help-category-grid';
import { AdminHelpPopularList } from '../admin-help/admin-help-popular-list';
import { AdminHelpSearch } from '../admin-help/admin-help-search';
import { AdminListPageHeader } from './admin-list-page-header';

export function AidePageContent() {
  const t = useTranslations('pages.aide');
  useSetAdminPageMeta({ title: t('title') });

  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="aide" />

      <div className="mx-auto w-full max-w-4xl space-y-8 sm:space-y-12">
        <div className="w-full max-w-2xl">
          <AdminHelpSearch />
        </div>

        <AdminHelpCategoryGrid />
        <AdminHelpPopularList />
      </div>
    </div>
  );
}
