'use client';

import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { CruiseLinesList } from '../cruises/cruise-lines-list';
import { AdminIntroPage } from './admin-intro-page';

export function LignesCroisierePageContent() {
  return (
    <AdminIntroPage
      routePath="produits/croisieres/lignes"
      backHref="/produits/croisieres"
      backLabelKey="backLabel"
    >
      <CruisesStatCards className="mb-6" />
      <CruiseLinesList />
    </AdminIntroPage>
  );
}
