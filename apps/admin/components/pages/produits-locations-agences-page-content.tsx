'use client';

import { RentalAgenciesList } from '../locations/rental-agencies-list';
import { AdminIntroPage } from './admin-intro-page';

export function AgencesLocationPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/locations/agences"
      backHref="/produits/locations"
      backLabelKey="backLabel"
    >
      <RentalAgenciesList />
    </AdminIntroPage>
  );
}
