import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { VehicleForm } from '../../../../../components/locations/vehicle-form';

export const metadata: Metadata = {
  title: 'Nouveau véhicule — Africa Tourism Gate Admin',
};

export default function NouveauVehiculePage() {
  return (
    <div>
      <AdminPageIntro description={"Associez une agence et une catégorie, puis définissez les créneaux de disponibilité."} />
      <VehicleForm mode="create" />
    </div>
  );
}
