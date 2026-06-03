import type { Metadata } from 'next';
import { PromoCodeEditPage } from '../../../../../components/promo-codes/promo-code-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier le code promo — Africa Tourism Gate Admin',
};

export default function EditPromoCodePage({ params }: PageProps) {
  return <PromoCodeEditPage promoCodeId={params.id} />;
}
