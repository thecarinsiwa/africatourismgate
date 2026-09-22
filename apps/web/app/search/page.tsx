import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteSearchPageContent } from '../../components/site-search/site-search-page-content';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function readQuery(searchParams: PageProps['searchParams']): string {
  const raw = searchParams.q;
  if (typeof raw === 'string') return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0].trim();
  return '';
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const t = await getTranslations('siteSearch');
  const query = readQuery(searchParams);
  const title = query
    ? t('resultsPageSubtitle', { query })
    : t('resultsPageTitle');
  const description = t('resultsPageTitle');
  const canonical = query
    ? `/search?q=${encodeURIComponent(query)}`
    : '/search';

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function SiteSearchPage({ searchParams }: PageProps) {
  const initialQuery = readQuery(searchParams);
  return <SiteSearchPageContent initialQuery={initialQuery} />;
}
