import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PackageEditPage } from '../../../../../components/packages/package-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/forfaits/id');
}

export default function EditForfaitPage({ params }: PageProps) {
  return <PackageEditPage packageId={params.id} />;
}
