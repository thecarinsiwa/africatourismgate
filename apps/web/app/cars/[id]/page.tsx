import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { CarDetailPageContent } from '../../../components/cars/car-detail-page-content';
import { getVehicleDetail } from '../../../lib/api/public';
import {
  normalizeCarsSearchParams,
  toVehicleDetailQuery,
} from '../../../lib/cars/listings';
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
  const path = `/cars/${params.id}`;
  const normalized = normalizeCarsSearchParams(searchParams);
  const apiQuery = toVehicleDetailQuery(normalized);

  if (!apiQuery) {
    return buildDetailFallbackMetadata('cars', path);
  }

  try {
    const [detail, t, locale] = await Promise.all([
      getVehicleDetail(params.id, apiQuery),
      getTranslations('cars'),
      getLocale(),
    ]);
    const title =
      detail.category.exampleModel ??
      detail.category.name ??
      detail.licensePlate ??
      t('detailMetaFallbackTitle');
    return buildPageMetadata({
      title,
      description: t('detailMetaDescription', {
        name: title,
        city: detail.agency.city || detail.agency.name,
      }),
      path,
      locale,
      images: pickOgImages(detail.images, detail.imageUrl),
      twitterCard: 'summary_large_image',
    });
  } catch {
    return buildDetailFallbackMetadata('cars', path);
  }
}

export default function CarDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizeCarsSearchParams(searchParams);

  return (
    <CarDetailPageContent vehicleId={params.id} initialSearch={initialSearch} />
  );
}
