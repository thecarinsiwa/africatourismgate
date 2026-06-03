import type { Metadata } from 'next';
import { VerticalSearchPage } from '../../../components/search/vertical-search-page';
import { fetchVerticalResults } from '../../../lib/search/api';
import type { SearchVertical } from '../../../lib/search/route';

type PageProps = {
  params: { type: SearchVertical };
  searchParams: Record<string, string | string[] | undefined>;
};

function pick(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const title = `${params.type.charAt(0).toUpperCase()}${params.type.slice(1)} search`;
  return {
    title,
    description: `Explore ${params.type} options on Africa Tourism Gate.`,
    alternates: {
      canonical: `/search/${params.type}`,
      languages: {
        fr: `/search/${params.type}?lang=fr`,
        en: `/search/${params.type}?lang=en`,
        es: `/search/${params.type}?lang=es`,
      },
    },
  };
}

export default async function VerticalSearchRoute({ params, searchParams }: PageProps) {
  const vertical = params.type;
  const destination = pick(searchParams.destination);
  const items = await fetchVerticalResults(vertical, destination);
  return <VerticalSearchPage vertical={vertical} destination={destination} items={items} />;
}
