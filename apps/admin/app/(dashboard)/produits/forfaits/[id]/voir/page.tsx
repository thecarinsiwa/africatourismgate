import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { PackageViewPage } from '../../../../../../components/packages/package-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/forfaits/id/voir');
}

export default function ViewForfaitPage({ params }: PageProps) {
  return <PackageViewPage packageId={params.id} />;
}
