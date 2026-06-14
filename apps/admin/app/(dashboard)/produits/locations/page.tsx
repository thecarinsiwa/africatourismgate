import type { Metadata } from 'next';
import { PageHeader, TextLink } from '@africatourismgate/ui';
import { VehiclesList } from '../../../../components/locations/vehicles-list';

export const metadata: Metadata = {
  title: 'Locations véhicules — Africa Tourism Gate Admin',
};

export default function LocationsPage() {
  return (
    <div>
      <PageHeader
        title="Locations véhicules"
        description="Véhicules par agence, catégories et créneaux de disponibilité."
      />
      <p className="-mt-4 mb-6 text-sm text-atg-muted">
        <TextLink href="/produits/locations/agences" variant="primary" className="font-medium">
          Agences de location
        </TextLink>
        <span className="mx-2">·</span>
        <TextLink href="/produits/locations/categories" variant="primary" className="font-medium">
          Catégories
        </TextLink>
      </p>
      <VehiclesList />
    </div>
  );
}
