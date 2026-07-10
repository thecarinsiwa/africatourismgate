import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPageLoading } from '../../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { VehicleAvailabilityPage } from '../../../../../../components/locations/vehicle-availability-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/id/disponibilites');
}

export default function VehicleDisponibilitesRoutePage({ params }: PageProps) {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <VehicleAvailabilityPage vehicleId={params.id} />
    </Suspense>
  );
}
