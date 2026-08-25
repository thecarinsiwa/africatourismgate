import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { PromotionViewPage } from '../../../../../../components/promotions/promotion-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/promotions/id/voir');
}

export default function ViewPromotionPage({ params }: PageProps) {
  return <PromotionViewPage promotionId={params.id} />;
}
