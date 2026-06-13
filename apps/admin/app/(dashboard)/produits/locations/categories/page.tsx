import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { VehicleCategoriesList } from '../../../../../components/locations/vehicle-categories-list';

export const metadata: Metadata = {
  title: 'Catégories véhicules — Africa Tourism Gate Admin',
};

export default function CategoriesVehiculesPage() {
  return (
    <div>
      <AdminPageIntro description={"Types de véhicules (économique, SUV, premium, etc.)."} />
      <VehicleCategoriesList />
    </div>
  );
}
