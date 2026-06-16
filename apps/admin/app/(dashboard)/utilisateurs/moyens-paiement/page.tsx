import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { MoyensPaiementPageContent } from '../../../../components/pages/utilisateurs-moyens-paiement-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/moyens-paiement');
}

export default function Page() {
  return <MoyensPaiementPageContent />;
}
