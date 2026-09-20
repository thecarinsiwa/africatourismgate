import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FlightDetailPageContent } from '../../../components/flights/flight-detail-page-content';
import { getFlightDetail } from '../../../lib/api/public';
import {
  normalizeFlightsSearchParams,
  readSearchParam,
  toFlightDetailQuery,
} from '../../../lib/flights/listings';
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
  const path = `/flights/${params.id}`;
  const normalized = normalizeFlightsSearchParams(searchParams);
  const apiQuery = toFlightDetailQuery(normalized);

  if (!apiQuery) {
    return buildDetailFallbackMetadata('flights', path);
  }

  try {
    const [detail, t, locale] = await Promise.all([
      getFlightDetail(params.id, apiQuery),
      getTranslations('flights'),
      getLocale(),
    ]);
    return buildPageMetadata({
      title: `${detail.airlineName} ${detail.flightNumber}`,
      description: t('detailMetaDescription', {
        flightNumber: detail.flightNumber,
        from: detail.departureAirport.city,
        to: detail.arrivalAirport.city,
      }),
      path,
      locale,
      images: pickOgImages(detail.images),
      twitterCard: 'summary_large_image',
    });
  } catch {
    return buildDetailFallbackMetadata('flights', path);
  }
}

export default function FlightDetailPage({ params, searchParams }: PageProps) {
  const normalized = normalizeFlightsSearchParams(searchParams);
  const initialSearch = {
    ...normalized,
    classId: readSearchParam(searchParams.classId),
  };

  return (
    <FlightDetailPageContent flightId={params.id} initialSearch={initialSearch} />
  );
}
