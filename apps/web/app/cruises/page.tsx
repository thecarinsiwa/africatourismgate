import type { Metadata } from 'next';
import { CruisesPageContent } from '../../components/cruises/cruises-page-content';
import { normalizeCruisesSearchParams } from '../../lib/cruises/listings';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('cruises', '/cruises');
}

export default function CruisesPage({ searchParams }: PageProps) {
  const initialSearch = normalizeCruisesSearchParams(searchParams);

  return <CruisesPageContent initialSearch={initialSearch} />;
}
