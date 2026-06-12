import type { Metadata } from 'next';
import { CruisesPageContent } from '../../components/cruises/cruises-page-content';
import { normalizeCruisesSearchParams } from '../../lib/cruises/listings';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: 'Croisières en Afrique',
  description:
    'Comparez et réservez des croisières fluviales et côtières en Afrique avec Africa Tourism Gate.',
  alternates: {
    canonical: '/cruises',
    languages: {
      fr: '/cruises?lang=fr',
      en: '/cruises?lang=en',
      es: '/cruises?lang=es',
    },
  },
};

export default function CruisesPage({ searchParams }: PageProps) {
  const initialSearch = normalizeCruisesSearchParams(searchParams);

  return <CruisesPageContent initialSearch={initialSearch} />;
}
