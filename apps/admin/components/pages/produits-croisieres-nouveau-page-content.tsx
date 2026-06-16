'use client';

import { SailingForm } from '../cruises/sailing-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauDepartPageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/nouveau">
      <SailingForm mode="create" />
    </AdminIntroPage>
  );
}
