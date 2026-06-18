import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { DestinationEditPage } from '../../../../../components/destinations/destination-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/destinations/id');
}

export default function EditDestinationPage({ params }: PageProps) {
  return <DestinationEditPage destinationId={params.id} />;
}
