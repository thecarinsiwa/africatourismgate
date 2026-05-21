import type { Metadata } from 'next';
import { VehicleEditPage } from '../../../../../components/locations/vehicle-edit-page';

export const metadata: Metadata = {
  title: 'Modifier le véhicule — Africa Tourism Gate Admin',
};

type PageProps = {
  params: { id: string };
};

export default function ModifierVehiculePage({ params }: PageProps) {
  return <VehicleEditPage vehicleId={params.id} />;
}
