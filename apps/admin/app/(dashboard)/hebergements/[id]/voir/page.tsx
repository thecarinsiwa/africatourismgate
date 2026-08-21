import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PropertyViewPage } from '../../../../../components/properties/property-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('hebergements/id/voir');
}

export default function ViewHebergementPage({ params }: PageProps) {
  return <PropertyViewPage propertyId={params.id} />;
}
