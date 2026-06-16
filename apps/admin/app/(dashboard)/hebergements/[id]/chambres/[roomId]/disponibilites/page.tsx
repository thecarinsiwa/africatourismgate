import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../../lib/i18n/admin-page-i18n';
import { RoomAvailabilityPage } from '../../../../../../../components/properties/room-availability-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('hebergements/id/chambres/roomId/disponibilites');
}

type PageProps = {
  params: { id: string; roomId: string };
};

export default function RoomDisponibilitesRoutePage({ params }: PageProps) {
  return (
    <RoomAvailabilityPage propertyId={params.id} roomId={params.roomId} />
  );
}
