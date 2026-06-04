import type { Metadata } from 'next';
import { ReviewDetailPage } from '../../../../../components/reviews/review-detail-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Détail avis — Africa Tourism Gate Admin',
};

export default function ReviewDetailRoutePage({ params }: PageProps) {
  return <ReviewDetailPage reviewId={params.id} />;
}
