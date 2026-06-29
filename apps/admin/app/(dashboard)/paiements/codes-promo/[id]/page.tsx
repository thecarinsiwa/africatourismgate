import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PromoCodeEditPage } from '../../../../../components/promo-codes/promo-code-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/codes-promo/id');
}

export default function EditPromoCodePage({ params }: PageProps) {
  return <PromoCodeEditPage promoCodeId={params.id} />;
}
