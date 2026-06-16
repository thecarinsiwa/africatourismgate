import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { NouveauUtilisateurPageContent } from '../../../../components/pages/utilisateurs-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/nouveau');
}

export default function Page() {
  return <NouveauUtilisateurPageContent />;
}
