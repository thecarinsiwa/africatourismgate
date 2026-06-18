'use client';

import { FlightForm } from '../flights/flight-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauVolPageContent() {
  return (
    <AdminIntroPage routePath="produits/vols/nouveau" backHref="/produits/vols" backLabelKey="backLabel">
      <FlightForm mode="create" />
    </AdminIntroPage>
  );
}
