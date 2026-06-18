import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { VehicleEditPage } from '../../../../../components/locations/vehicle-edit-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/id');
}

type PageProps = {
  params: { id: string };
};

export default function ModifierVehiculePage({ params }: PageProps) {
  return <VehicleEditPage vehicleId={params.id} />;
}
