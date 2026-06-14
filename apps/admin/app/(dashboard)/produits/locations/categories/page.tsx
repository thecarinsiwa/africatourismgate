import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { AdminPageBackLink } from '../../../../../components/admin-page-back-link';
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
      <VehicleCategoriesList />
    </div>
  );
}
