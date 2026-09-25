import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PartnerDetailPageContent } from '../../../components/partners/partner-detail-page-content';
import { getPublicActivityProvider } from '../../../lib/api/public';
import {
  buildDetailFallbackMetadata,
  buildPageMetadata,
  pickOgImages,
  truncateMetaDescription,
} from '../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = `/partners/${params.id}`;

  try {
    const [detail, t, locale] = await Promise.all([
      getPublicActivityProvider(params.id),
      getTranslations('partners'),
      getLocale(),
    ]);
    return buildPageMetadata({
      title: detail.name,
      description: truncateMetaDescription(
        t('detailMetaDescription', {
          name: detail.name,
          destination: detail.destinationName,
        }),
      ),
      path,
      locale,
      images: pickOgImages(null, detail.logoUrl),
      twitterCard: detail.logoUrl ? 'summary_large_image' : 'summary',
    });
  } catch {
    return buildDetailFallbackMetadata('partners', path);
  }
}

export default function PartnerDetailPage({ params }: PageProps) {
  return <PartnerDetailPageContent partnerId={params.id} />;
}
