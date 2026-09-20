import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { HotelDetailPageContent } from '../../../components/hotels/hotel-detail-page-content';
import { getAccommodationDetail } from '../../../lib/api/public';
import {
  buildDetailFallbackMetadata,
  buildPageMetadata,
  pickOgImages,
} from '../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = `/hotels/${params.id}`;
  try {
    const [detail, t, locale] = await Promise.all([
      getAccommodationDetail(params.id),
      getTranslations('hotels'),
      getLocale(),
    ]);
    return buildPageMetadata({
      title: detail.name,
      description: t('detailMetaDescription', { name: detail.name }),
      path,
      locale,
      images: pickOgImages(detail.images),
      twitterCard: 'summary_large_image',
    });
  } catch {
    return buildDetailFallbackMetadata('hotels', path);
  }
}

export default function HotelDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = {
    checkIn: pickParam(searchParams.checkIn),
    checkOut: pickParam(searchParams.checkOut),
    guests: pickParam(searchParams.guests),
    roomId: pickParam(searchParams.roomId),
  };

  return (
    <HotelDetailPageContent propertyId={params.id} initialSearch={initialSearch} />
  );
}
