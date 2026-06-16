'use client';

import { VehicleForm } from '../locations/vehicle-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauVehiculePageContent() {
  return (
    <AdminIntroPage routePath="produits/locations/nouveau" backHref="/produits/locations" backLabelKey="backLabel">
      <VehicleForm mode="create" />
    </AdminIntroPage>
  );
}
