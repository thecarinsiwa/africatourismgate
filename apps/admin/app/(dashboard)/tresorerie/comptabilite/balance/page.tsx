import type { Metadata } from 'next';
import { TresorerieComptabiliteBalancePageContent } from '../../../../../components/pages/tresorerie-comptabilite-balance-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/balance');
}

export default function TresorerieComptabiliteBalancePage() {
  return <TresorerieComptabiliteBalancePageContent />;
}
