import type { Metadata } from 'next';
import { TresorerieRapportsPageContent } from '../../../../components/pages/tresorerie-rapports-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/rapports');
}

export default function TresorerieRapportsPage() {
  return <TresorerieRapportsPageContent />;
}
