import type { Metadata } from 'next';
import { SailingEditPage } from '../../../../components/cruises/sailing-edit-page';

export const metadata: Metadata = {
  title: 'Départ — Africa Tourism Gate Admin',
};

type PageProps = { params: { id: string } };

export default function DepartEditPage({ params }: PageProps) {
  return <SailingEditPage sailingId={params.id} />;
}
