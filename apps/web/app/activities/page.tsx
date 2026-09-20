import type { Metadata } from 'next';
import { ActivitiesPageContent } from '../../components/activities/activities-page-content';
import { normalizeActivitiesSearchParams } from '../../lib/activities/listings';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('activities', '/activities');
}

export default function ActivitiesPage({ searchParams }: PageProps) {
  const initialSearch = normalizeActivitiesSearchParams(searchParams);

  return <ActivitiesPageContent initialSearch={initialSearch} />;
}
