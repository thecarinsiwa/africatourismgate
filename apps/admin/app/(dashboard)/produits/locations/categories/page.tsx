import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { AdminPageBackLink } from '../../../../../components/admin-page-back-link';
import { LocationsStatCards } from '../../../../../components/locations/locations-stat-cards';
import { VehicleCategoriesList } from '../../../../../components/locations/vehicle-categories-list';

export const metadata: Metadata = {
  title: 'Catégories véhicules — Africa Tourism Gate Admin',
};

export default function CategoriesVehiculesPage() {
  return (
    <div>
      <PageHeader
        title="Catégories véhicules"
        description="Types de véhicules (compact, SUV, premium, etc.)."
        breadcrumb={
          <AdminPageBackLink href="/produits/locations" label="Retour aux véhicules" />
        }
      />
      <LocationsStatCards className="mb-6" />
      <VehicleCategoriesList />
    </div>
  );
}
