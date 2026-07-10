import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { VehicleViewPage } from '../../../../../../components/locations/vehicle-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/id/voir');
}

export default function ViewVehiculePage({ params }: PageProps) {
  return <VehicleViewPage vehicleId={params.id} />;
}
