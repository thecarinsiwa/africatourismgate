import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { AdminPageBackLink } from '../../../../../components/admin-page-back-link';
import { VehicleForm } from '../../../../../components/locations/vehicle-form';

export const metadata: Metadata = {
  title: 'Nouveau véhicule — Africa Tourism Gate Admin',
};

export default function NouveauVehiculePage() {
  return (
    <div>
      <PageHeader
        title="Nouveau véhicule"
        description="Associez une agence et une catégorie, puis définissez les créneaux de disponibilité."
        breadcrumb={
          <AdminPageBackLink href="/produits/locations" label="Retour aux véhicules" />
        }
      />
      <VehicleForm mode="create" />
    </div>
  );
}
