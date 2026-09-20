import type { Metadata } from 'next';
import { PackagesPageContent } from '../../components/packages/packages-page-content';
import { normalizePackagesSearchParams } from '../../lib/packages/listings';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('packages', '/packages');
}

export default function PackagesPage({ searchParams }: PageProps) {
  const initialSearch = normalizePackagesSearchParams(searchParams);

  return <PackagesPageContent initialSearch={initialSearch} />;
}
