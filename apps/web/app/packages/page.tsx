import type { Metadata } from 'next';
import { PackagesPageContent } from '../../components/packages/packages-page-content';
import { normalizePackagesSearchParams } from '../../lib/packages/listings';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: 'Forfaits combinés en Afrique',
  description:
    'Découvrez nos forfaits combinés : hébergements, activités et plus, avec remises exclusives sur Africa Tourism Gate.',
  alternates: {
    canonical: '/packages',
    languages: {
      fr: '/packages?lang=fr',
      en: '/packages?lang=en',
      es: '/packages?lang=es',
    },
  },
};

export default function PackagesPage({ searchParams }: PageProps) {
  const initialSearch = normalizePackagesSearchParams(searchParams);

  return <PackagesPageContent initialSearch={initialSearch} />;
}
