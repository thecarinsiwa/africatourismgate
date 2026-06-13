import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { VehiclesList } from '../../../../components/locations/vehicles-list';

export const metadata: Metadata = {
  title: 'Locations véhicules — Africa Tourism Gate Admin',
};

export default function LocationsPage() {
  return (
    <div>
      <AdminPageIntro
        description="Véhicules par agence, catégories et créneaux de disponibilité."
        links={[
          { href: '/produits/locations/agences', label: 'Agences de location' },
          { href: '/produits/locations/categories', label: 'Catégories' },
        ]}
      />
      <VehiclesList />
    </div>
  );
}
