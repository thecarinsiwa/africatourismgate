import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { DestinationViewPage } from '../../../../../../components/destinations/destination-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/destinations/id/voir');
}

export default function ViewDestinationPage({ params }: PageProps) {
  return <DestinationViewPage destinationId={params.id} />;
}
