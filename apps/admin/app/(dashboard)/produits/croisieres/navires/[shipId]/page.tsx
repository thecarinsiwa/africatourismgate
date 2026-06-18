import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { ShipEditPage } from '../../../../../../components/cruises/ship-edit-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/navires/shipId');
}

type PageProps = { params: { shipId: string } };

export default function NavireEditPage({ params }: PageProps) {
  return <ShipEditPage shipId={params.shipId} />;
}
