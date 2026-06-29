import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { LignesCroisierePageContent } from '../../../../../components/pages/produits-croisieres-lignes-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/lignes');
}

export default function Page() {
  return <LignesCroisierePageContent />;
}
