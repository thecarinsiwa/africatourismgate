import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { ReviewDetailPage } from '../../../../../components/reviews/review-detail-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/avis/id');
}

export default function ReviewDetailRoutePage({ params }: PageProps) {
  return <ReviewDetailPage reviewId={params.id} />;
}
