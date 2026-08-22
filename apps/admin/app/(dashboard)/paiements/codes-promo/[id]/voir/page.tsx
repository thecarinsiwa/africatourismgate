import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';
import { PromoCodeViewPage } from '../../../../../../components/promo-codes/promo-code-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/codes-promo/id/voir');
}

export default function ViewPromoCodePage({ params }: PageProps) {
  return <PromoCodeViewPage promoCodeId={params.id} />;
}
