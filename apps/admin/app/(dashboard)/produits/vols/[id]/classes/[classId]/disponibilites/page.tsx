import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../../../lib/i18n/admin-page-i18n';
import { FlightClassAvailabilityPage } from '../../../../../../../../components/flights/flight-class-availability-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols/id/classes/classId/disponibilites');
}

type PageProps = {
  params: { id: string; classId: string };
};

export default function DisponibilitesClassePage({ params }: PageProps) {
  return (
    <FlightClassAvailabilityPage flightId={params.id} classId={params.classId} />
  );
}
