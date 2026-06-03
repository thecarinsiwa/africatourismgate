import type { Metadata } from 'next';
import { HotelDetailPageContent } from '../../../components/hotels/hotel-detail-page-content';
import { getAccommodationDetail } from '../../../lib/api/public';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const detail = await getAccommodationDetail(params.id);
    return {
      title: detail.name,
      description: `Réservez votre séjour à ${detail.name}. Galerie, équipements et chambres.`,
    };
  } catch {
    return {
      title: 'Hébergement',
      description: 'Fiche produit hébergement — Africa Tourism Gate',
    };
  }
}

export default function HotelDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = {
    checkIn: pickParam(searchParams.checkIn),
    checkOut: pickParam(searchParams.checkOut),
    guests: pickParam(searchParams.guests),
    roomId: pickParam(searchParams.roomId),
  };

  return (
    <HotelDetailPageContent propertyId={params.id} initialSearch={initialSearch} />
  );
}
