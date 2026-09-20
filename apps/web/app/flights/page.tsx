import type { Metadata } from 'next';
import {
  FlightsPageContent,
  type FlightsSearchParams,
} from '../../components/flights/flights-page-content';
import { normalizeFlightsSearchParams } from '../../lib/flights/listings';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('flights', '/flights');
}

export default function FlightsPage({ searchParams }: PageProps) {
  const initialSearch: FlightsSearchParams = normalizeFlightsSearchParams(searchParams);

  return <FlightsPageContent initialSearch={initialSearch} />;
}
