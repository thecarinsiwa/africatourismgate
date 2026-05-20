import type { Metadata } from 'next';
import { RoomAvailabilityPage } from '../../../../../../../components/properties/room-availability-page';

export const metadata: Metadata = {
  title: 'Disponibilités chambre — Africa Tourism Gate Admin',
};

type PageProps = {
  params: { id: string; roomId: string };
};

export default function RoomDisponibilitesRoutePage({ params }: PageProps) {
  return (
    <RoomAvailabilityPage propertyId={params.id} roomId={params.roomId} />
  );
}
