import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { CodesPromoPageContent } from '../../../../components/pages/paiements-codes-promo-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/codes-promo');
}

export default function Page() {
  return <CodesPromoPageContent />;
}
