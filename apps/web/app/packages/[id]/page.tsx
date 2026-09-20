import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PackageDetailPageContent } from '../../../components/packages/package-detail-page-content';
import { getPackageDetail } from '../../../lib/api/public';
import { normalizePackagesSearchParams } from '../../../lib/packages/listings';
import {
  buildDetailFallbackMetadata,
  buildPageMetadata,
  pickOgImages,
  truncateMetaDescription,
} from '../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = `/packages/${params.id}`;
  try {
    const [detail, t, locale] = await Promise.all([
      getPackageDetail(params.id),
      getTranslations('packages'),
      getLocale(),
    ]);
    const name = detail.package.name;
    const description = detail.package.description
      ? truncateMetaDescription(detail.package.description)
      : t('detailMetaDescription', { name });
    return buildPageMetadata({
      title: name,
      description,
      path,
      locale,
      images: pickOgImages(detail.images),
      twitterCard: 'summary_large_image',
    });
  } catch {
    return buildDetailFallbackMetadata('packages', path);
  }
}

export default function PackageDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizePackagesSearchParams(searchParams);

  return (
    <PackageDetailPageContent packageId={params.id} initialSearch={initialSearch} />
  );
}
