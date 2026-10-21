import type { Metadata } from 'next';
import { TresorerieComptabiliteCloturePageContent } from '../../../../../components/pages/tresorerie-comptabilite-cloture-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/cloture');
}

export default function TresorerieComptabiliteCloturePage() {
  return <TresorerieComptabiliteCloturePageContent />;
}
