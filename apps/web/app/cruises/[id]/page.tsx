import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { CruiseDetailPageContent } from '../../../components/cruises/cruise-detail-page-content';
import { getCruiseSailingDetail } from '../../../lib/api/public';
import {
  normalizeCruisesSearchParams,
  parseGuestsParam,
  toCruiseSailingDetailQuery,
} from '../../../lib/cruises/listings';
import {
  buildDetailFallbackMetadata,
  buildPageMetadata,
  pickOgImages,
} from '../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const path = `/cruises/${params.id}`;
  const normalized = normalizeCruisesSearchParams(searchParams);
  const apiQuery = toCruiseSailingDetailQuery(normalized);

  try {
    const [detail, t, locale] = await Promise.all([
      getCruiseSailingDetail(params.id, apiQuery),
      getTranslations('cruises'),
      getLocale(),
    ]);
    return buildPageMetadata({
      title: detail.itineraryName,
      description: t('detailMetaDescription', {
        name: detail.itineraryName,
        ship: detail.shipName,
      }),
      path,
      locale,
      images: pickOgImages(detail.images),
      twitterCard: 'summary_large_image',
    });
  } catch {
    return buildDetailFallbackMetadata('cruises', path);
  }
}

export default function CruiseDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizeCruisesSearchParams(searchParams);
  const guests = parseGuestsParam(initialSearch.guests);

  return (
    <CruiseDetailPageContent
      sailingId={params.id}
      initialSearch={{
        ...initialSearch,
        guests: String(guests),
        cabinId: typeof searchParams.cabinId === 'string' ? searchParams.cabinId : undefined,
      }}
    />
  );
}
