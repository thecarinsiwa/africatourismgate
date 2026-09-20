import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { VerticalSearchPage } from '../../../components/search/vertical-search-page';
import { fetchVerticalResults } from '../../../lib/search/api';
import {
  isSearchVertical,
  type SearchVertical,
} from '../../../lib/search/route';
import { buildPageMetadata } from '../../../lib/seo/metadata';

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
  const path = `/search/${params.type}`;
  const [t, locale] = await Promise.all([
    getTranslations('verticalSearch'),
    getLocale(),
  ]);
  const label = isSearchVertical(params.type)
    ? t(`verticals.${params.type}`)
    : params.type;
  return buildPageMetadata({
    title: t('metaTitle', { label }),
    description: t('metaDescription', { label }),
    path,
    locale,
  });
}

export default async function VerticalSearchRoute({ params, searchParams }: PageProps) {
  const vertical = params.type;
  const destination = pick(searchParams.destination);
  const items = await fetchVerticalResults(vertical, destination);
  return <VerticalSearchPage vertical={vertical} destination={destination} items={items} />;
}
