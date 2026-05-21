import type { Metadata } from 'next';
import { ShipEditPage } from '../../../../../../components/cruises/ship-edit-page';

export const metadata: Metadata = {
  title: 'Navire — Africa Tourism Gate Admin',
};

type PageProps = { params: { shipId: string } };

export default function NavireEditPage({ params }: PageProps) {
  return <ShipEditPage shipId={params.shipId} />;
}
