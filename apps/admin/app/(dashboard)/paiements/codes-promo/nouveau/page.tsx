import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauCodePromoPageContent } from '../../../../../components/pages/paiements-codes-promo-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements/codes-promo/nouveau');
}

export default function Page() {
  return <NouveauCodePromoPageContent />;
}
