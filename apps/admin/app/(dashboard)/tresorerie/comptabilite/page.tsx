import type { Metadata } from 'next';
import { TresorerieComptabilitePageContent } from '../../../../components/pages/tresorerie-comptabilite-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite');
}

export default function TresorerieComptabilitePage() {
  return <TresorerieComptabilitePageContent />;
}
