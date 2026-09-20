import type { Metadata } from 'next';
import { CarsPageContent } from '../../components/cars/cars-page-content';
import { normalizeCarsSearchParams } from '../../lib/cars/listings';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('cars', '/cars');
}

export default function CarsPage({ searchParams }: PageProps) {
  const initialSearch = normalizeCarsSearchParams(searchParams);

  return <CarsPageContent initialSearch={initialSearch} />;
}
