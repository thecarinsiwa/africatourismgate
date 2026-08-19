'use client';

import { ActivityProvidersList } from '../activities/activity-providers-list';
import { ActivitiesStatCards } from '../activities/activities-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function FournisseursActivitesPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="produits/activites/fournisseurs" />
      <ActivitiesStatCards className="mb-6" />
      <ActivityProvidersList />
    </div>
  );
}
