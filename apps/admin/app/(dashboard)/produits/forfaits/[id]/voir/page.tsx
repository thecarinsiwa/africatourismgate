import type { Metadata } from 'next';
import { PackageViewPage } from '../../../../../../components/packages/package-view-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Voir le forfait — Africa Tourism Gate Admin',
};

export default function ViewForfaitPage({ params }: PageProps) {
  return <PackageViewPage packageId={params.id} />;
}
