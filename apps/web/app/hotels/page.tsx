import type { Metadata } from 'next';
import { HotelsPageContent, type HotelsSearchParams } from '../../components/hotels/hotels-page-content';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('hotels', '/hotels');
}

export default function HotelsPage({ searchParams }: PageProps) {
  const initialSearch: HotelsSearchParams = {
    destination: pickParam(searchParams.destination),
    checkIn: pickParam(searchParams.checkIn),
    checkOut: pickParam(searchParams.checkOut),
    guests: pickParam(searchParams.guests),
  };

  return <HotelsPageContent initialSearch={initialSearch} />;
}
