import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { FlightEditPage } from '../../../../../components/flights/flight-edit-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/vols/id');
}

type PageProps = {
  params: { id: string };
};

export default function ModifierVolPage({ params }: PageProps) {
  return <FlightEditPage flightId={params.id} />;
}
