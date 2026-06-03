import type { Metadata } from 'next';
import { PromotionEditPage } from '../../../../../components/promotions/promotion-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier la promotion — Africa Tourism Gate Admin',
};

export default function EditPromotionPage({ params }: PageProps) {
  return <PromotionEditPage promotionId={params.id} />;
}
