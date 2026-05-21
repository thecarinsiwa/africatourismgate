import type { Metadata } from 'next';
import { PackageEditPage } from '../../../../../components/packages/package-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier le forfait — Africa Tourism Gate Admin',
};

export default function EditForfaitPage({ params }: PageProps) {
  return <PackageEditPage packageId={params.id} />;
}
