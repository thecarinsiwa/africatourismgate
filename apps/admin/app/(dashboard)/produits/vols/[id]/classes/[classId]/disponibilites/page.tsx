import type { Metadata } from 'next';
import { FlightClassAvailabilityPage } from '../../../../../../../../components/flights/flight-class-availability-page';

export const metadata: Metadata = {
  title: 'Disponibilités classe — Africa Tourism Gate Admin',
};

type PageProps = {
  params: { id: string; classId: string };
};

export default function DisponibilitesClassePage({ params }: PageProps) {
  return (
    <FlightClassAvailabilityPage flightId={params.id} classId={params.classId} />
  );
}
