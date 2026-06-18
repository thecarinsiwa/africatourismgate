import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { PaiementsPageContent } from '../../../components/pages/paiements-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('paiements');
}

export default function Page() {
  return <PaiementsPageContent />;
}
