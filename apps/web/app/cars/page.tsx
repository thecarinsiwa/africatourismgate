import type { Metadata } from 'next';
import { CarsPageContent } from '../../components/cars/cars-page-content';
import { normalizeCarsSearchParams } from '../../lib/cars/listings';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: 'Location de voitures en Afrique',
  description:
    'Comparez et réservez des véhicules de location aux principales destinations africaines avec Africa Tourism Gate.',
  alternates: {
    canonical: '/cars',
    languages: {
      fr: '/cars?lang=fr',
      en: '/cars?lang=en',
      es: '/cars?lang=es',
    },
  },
};

export default function CarsPage({ searchParams }: PageProps) {
  const initialSearch = normalizeCarsSearchParams(searchParams);

  return <CarsPageContent initialSearch={initialSearch} />;
}
