import type { Metadata } from 'next';
import { ActivitiesPageContent } from '../../components/activities/activities-page-content';
import { normalizeActivitiesSearchParams } from '../../lib/activities/listings';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: 'Activités & tours en Afrique',
  description:
    'Réservez des activités et tours guidés en Afrique avec Africa Tourism Gate.',
  alternates: {
    canonical: '/activities',
    languages: {
      fr: '/activities?lang=fr',
      en: '/activities?lang=en',
      es: '/activities?lang=es',
    },
  },
};

export default function ActivitiesPage({ searchParams }: PageProps) {
  const initialSearch = normalizeActivitiesSearchParams(searchParams);

  return <ActivitiesPageContent initialSearch={initialSearch} />;
}
