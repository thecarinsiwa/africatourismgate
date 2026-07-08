'use client';

import { ActivityForm } from '../activities/activity-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelleActivitePageContent() {
  return (
    <AdminIntroPage routePath="produits/activites/nouveau">
      <div className="rounded-xl border border-atg-border bg-atg-elevated/60 p-4 sm:p-6">
        <ActivityForm mode="create" />
      </div>
    </AdminIntroPage>
  );
}
