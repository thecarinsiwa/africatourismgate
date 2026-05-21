import type { Metadata } from 'next';
import { VehicleCategoriesList } from '../../../../../components/locations/vehicle-categories-list';

export const metadata: Metadata = {
  title: 'Catégories véhicules — Africa Tourism Gate Admin',
};

export default function CategoriesVehiculesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Catégories de véhicules</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Types de véhicules (économique, SUV, premium, etc.).
        </p>
      </div>
      <VehicleCategoriesList />
    </div>
  );
}
