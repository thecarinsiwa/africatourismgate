import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { VerticalComingSoonPage } from '../../../components/vertical-coming-soon-page';
import {
  buildSearchRoute,
  isSearchVertical,
  isSearchVerticalImplemented,
} from '../../../lib/search/route';
import { buildPageMetadata, PRIVATE_PAGE_ROBOTS } from '../../../lib/seo/metadata';

type PageProps = {
  params: { vertical: string };
  searchParams: Record<string, string | string[] | undefined>;
};

function toURLSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, value);
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = `/coming-soon/${params.vertical}`;
  const [t, tSearch, locale] = await Promise.all([
    getTranslations('comingSoon'),
    getTranslations('verticalSearch'),
    getLocale(),
  ]);

  if (!isSearchVertical(params.vertical)) {
    return buildPageMetadata({
      title: t('metaTitle'),
      description: t('metaDescription'),
      path,
      locale,
      robots: PRIVATE_PAGE_ROBOTS,
    });
  }

  if (isSearchVerticalImplemented(params.vertical)) {
    return { robots: PRIVATE_PAGE_ROBOTS };
  }

  const label = tSearch(`verticals.${params.vertical}`);
  return buildPageMetadata({
    title: t('verticalMetaTitle', { label }),
    description: t('verticalMetaDescription', { label }),
    path,
    locale,
    robots: PRIVATE_PAGE_ROBOTS,
  });
}

export default function VerticalComingSoonRoute({ params, searchParams }: PageProps) {
  if (!isSearchVertical(params.vertical)) {
    notFound();
  }

  if (isSearchVerticalImplemented(params.vertical)) {
    redirect(buildSearchRoute(params.vertical, toURLSearchParams(searchParams)));
  }

  return <VerticalComingSoonPage vertical={params.vertical} />;
}
