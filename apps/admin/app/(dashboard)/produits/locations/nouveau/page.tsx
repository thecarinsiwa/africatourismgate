import type { Metadata } from 'next';
import { VehicleForm } from '../../../../../components/locations/vehicle-form';

export const metadata: Metadata = {
  title: 'Nouveau véhicule — Africa Tourism Gate Admin',
};

export default function NouveauVehiculePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau véhicule</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Associez une agence et une catégorie, puis définissez les créneaux de disponibilité.
        </p>
      </div>
      <VehicleForm mode="create" />
    </div>
  );
}
