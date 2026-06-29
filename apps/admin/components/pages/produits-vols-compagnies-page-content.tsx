'use client';

import { AirlinesList } from '../flights/airlines-list';
import { AdminIntroPage } from './admin-intro-page';

export function CompagniesPageContent() {
  return (
    <AdminIntroPage routePath="produits/vols/compagnies" backHref="/produits/vols" backLabelKey="backLabel">
      <AirlinesList />
    </AdminIntroPage>
  );
}
