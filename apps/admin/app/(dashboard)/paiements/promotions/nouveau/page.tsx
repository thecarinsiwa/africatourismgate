import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouvellePromotionPageContent } from '../../../../../components/pages/paiements-promotions-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/promotions/nouveau');
}

export default function Page() {
  return <NouvellePromotionPageContent />;
}
