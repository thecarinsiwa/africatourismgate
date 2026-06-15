'use client';

import { AdminPageIntro } from './admin-page-intro';
import { SetAdminPageMeta } from './set-admin-page-meta';

type DashboardSectionPageProps = {
  title: string;
  description?: string;
};

export function DashboardSectionPage({
  title,
  description = 'Contenu à venir.',
}: DashboardSectionPageProps) {
  return (
    <>
      <SetAdminPageMeta title={title} />
      <AdminPageIntro description={description} />
    </>
  );
}
