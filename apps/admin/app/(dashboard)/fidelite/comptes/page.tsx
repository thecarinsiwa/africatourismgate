import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { ComptesFidelitePageContent } from '../../../../components/pages/fidelite-comptes-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('fidelite/comptes');
}

export default function Page() {
  return <ComptesFidelitePageContent />;
}
