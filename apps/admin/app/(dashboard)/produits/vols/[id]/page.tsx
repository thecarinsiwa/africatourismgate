import type { Metadata } from 'next';
import { FlightEditPage } from '../../../../../components/flights/flight-edit-page';

export const metadata: Metadata = {
  title: 'Modifier le vol — Africa Tourism Gate Admin',
};

type PageProps = {
  params: { id: string };
};

export default function ModifierVolPage({ params }: PageProps) {
  return <FlightEditPage flightId={params.id} />;
}
