'use client';

import { ActivityForm } from '../activities/activity-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelleActivitePageContent() {
  return (
    <AdminIntroPage
      routePath="produits/activites/nouveau"
      backHref="/produits/activites"
      backLabelKey="backLabel"
    >
      <ActivityForm mode="create" />
    </AdminIntroPage>
  );
}
