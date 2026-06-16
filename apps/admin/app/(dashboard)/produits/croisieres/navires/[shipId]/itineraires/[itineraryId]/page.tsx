import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../../../lib/i18n/admin-page-i18n';
import { ItineraryPortsPageContent } from '../../../../../../../../components/pages/produits-croisieres-navires-shipId-itineraires-itineraryId-page-content';

type PageProps = {
  params: { shipId: string; itineraryId: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/navires/shipId/itineraires/itineraryId');
}

export default function ItineraryPortsPage({ params }: PageProps) {
  return <ItineraryPortsPageContent shipId={params.shipId} itineraryId={params.itineraryId} />;
}
