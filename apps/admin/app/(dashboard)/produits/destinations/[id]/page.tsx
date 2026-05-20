import type { Metadata } from 'next';
import { DestinationEditPage } from '../../../../../components/destinations/destination-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier la destination — Africa Tourism Gate Admin',
};

export default function EditDestinationPage({ params }: PageProps) {
  return <DestinationEditPage destinationId={params.id} />;
}
