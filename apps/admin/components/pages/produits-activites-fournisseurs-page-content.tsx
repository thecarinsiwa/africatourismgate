'use client';

import { ActivityProvidersList } from '../activities/activity-providers-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function FournisseursActivitesPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/activites/fournisseurs" />
      <ActivityProvidersList />
    </div>
  );
}
