'use client';

import { ShipForm } from '../cruises/ship-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauNavirePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/navires/nouveau">
      <ShipForm mode="create" />
    </AdminIntroPage>
  );
}
