import type { Metadata } from 'next';
import Link from 'next/link';
import { VehiclesList } from '../../../../components/locations/vehicles-list';

export const metadata: Metadata = {
  title: 'Locations véhicules — Africa Tourism Gate Admin',
};

export default function LocationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Locations véhicules</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Véhicules par agence, catégories et créneaux de disponibilité.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/produits/locations/agences"
            className="font-medium text-primary hover:underline"
          >
            Agences de location
          </Link>
          <span className="mx-2 text-atg-muted">·</span>
          <Link
            href="/produits/locations/categories"
            className="font-medium text-primary hover:underline"
          >
            Catégories
          </Link>
        </p>
      </div>
      <VehiclesList />
    </div>
  );
}
