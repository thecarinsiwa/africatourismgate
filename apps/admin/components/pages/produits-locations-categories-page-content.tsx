'use client';

import { VehicleCategoriesList } from '../locations/vehicle-categories-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function CategoriesVehiculesPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/locations/categories" />
      <VehicleCategoriesList />
    </div>
  );
}
