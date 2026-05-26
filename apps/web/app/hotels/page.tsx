import type { Metadata } from 'next';
import { HotelsPageContent, type HotelsSearchParams } from '../../components/hotels/hotels-page-content';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export const metadata: Metadata = {
  title: 'Hébergements en Afrique',
  description:
    'Comparez hôtels, lodges et resorts en Afrique. Trouvez le séjour idéal avec Africa Tourism Gate.',
};

export default function HotelsPage({ searchParams }: PageProps) {
  const initialSearch: HotelsSearchParams = {
    destination: pickParam(searchParams.destination),
    checkIn: pickParam(searchParams.checkIn),
    checkOut: pickParam(searchParams.checkOut),
    guests: pickParam(searchParams.guests),
  };

  return <HotelsPageContent initialSearch={initialSearch} />;
}
