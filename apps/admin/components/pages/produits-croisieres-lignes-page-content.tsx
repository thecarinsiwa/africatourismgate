'use client';

import { CruiseLinesList } from '../cruises/cruise-lines-list';
import { AdminIntroPage } from './admin-intro-page';

export function LignesCroisierePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/lignes">
      <CruiseLinesList />
    </AdminIntroPage>
  );
}
