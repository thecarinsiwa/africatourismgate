import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PromotionEditPage } from '../../../../../components/promotions/promotion-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/promotions/id');
}

export default function EditPromotionPage({ params }: PageProps) {
  return <PromotionEditPage promotionId={params.id} />;
}
