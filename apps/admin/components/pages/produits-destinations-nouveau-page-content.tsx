'use client';

import { DestinationForm } from '../destinations/destination-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelleDestinationPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/destinations/nouveau"
      backHref="/produits/destinations"
      backLabelKey="backLabel"
    >
      <DestinationForm mode="create" />
    </AdminIntroPage>
  );
}
