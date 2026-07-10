import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { FlightViewPage } from '../../../../../components/flights/flight-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols/id/voir');
}

export default function ViewVolPage({ params }: PageProps) {
  return <FlightViewPage flightId={params.id} />;
}
