'use client';

import { VehicleCategoriesList } from '../locations/vehicle-categories-list';
import { AdminIntroPage } from './admin-intro-page';

export function CategoriesVehiculesPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/locations/categories"
      backHref="/produits/locations"
      backLabelKey="backLabel"
    >
      <VehicleCategoriesList />
    </AdminIntroPage>
  );
}
