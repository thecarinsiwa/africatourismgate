import type { Metadata } from 'next';
import { TresorerieComptabiliteCompteResultatPageContent } from '../../../../../components/pages/tresorerie-comptabilite-compte-resultat-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/compte-resultat');
}

export default function TresorerieComptabiliteCompteResultatPage() {
  return <TresorerieComptabiliteCompteResultatPageContent />;
}
