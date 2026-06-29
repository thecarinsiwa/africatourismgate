import type { Metadata } from 'next';
import {
  FlightsPageContent,
  type FlightsSearchParams,
} from '../../components/flights/flights-page-content';
import { normalizeFlightsSearchParams } from '../../lib/flights/listings';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: 'Vols en Afrique',
  description:
    'Comparez et réservez des vols vers les principales destinations africaines avec Africa Tourism Gate.',
  alternates: {
    canonical: '/flights',
    languages: {
      fr: '/flights?lang=fr',
      en: '/flights?lang=en',
      es: '/flights?lang=es',
    },
  },
};

export default function FlightsPage({ searchParams }: PageProps) {
  const initialSearch: FlightsSearchParams = normalizeFlightsSearchParams(searchParams);

  return <FlightsPageContent initialSearch={initialSearch} />;
}
