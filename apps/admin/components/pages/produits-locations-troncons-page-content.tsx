'use client';

import { VehicleRoutesList } from '../locations/vehicle-routes-list';
import { AdminIntroPage } from './admin-intro-page';

export function TronconsLocationsPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/locations/troncons"
      backHref="/produits/locations"
      backLabelKey="backLabel"
    >
      <VehicleRoutesList />
    </AdminIntroPage>
  );
}
