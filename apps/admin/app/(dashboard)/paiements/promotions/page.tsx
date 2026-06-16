import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { PromotionsPageContent } from '../../../../components/pages/paiements-promotions-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/promotions');
}

export default function Page() {
  return <PromotionsPageContent />;
}
