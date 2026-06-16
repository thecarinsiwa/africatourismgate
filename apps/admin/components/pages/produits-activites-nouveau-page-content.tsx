'use client';

import { ActivityForm } from '../activities/activity-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouvelleActivitePageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/activites/nouveau" titleKey="metaTitle" />
      <ActivityForm mode="create" />
    </div>
  );
}
