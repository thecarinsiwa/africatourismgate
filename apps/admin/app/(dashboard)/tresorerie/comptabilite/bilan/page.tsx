import type { Metadata } from 'next';
import { TresorerieComptabiliteBilanPageContent } from '../../../../../components/pages/tresorerie-comptabilite-bilan-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/bilan');
}

export default function TresorerieComptabiliteBilanPage() {
  return <TresorerieComptabiliteBilanPageContent />;
}
