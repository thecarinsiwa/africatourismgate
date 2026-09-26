import type { Metadata } from 'next';
import { TresorerieHubPageContent } from '../../../components/pages/tresorerie-hub-page-content';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie');
}

export default function TresoreriePage() {
  return <TresorerieHubPageContent />;
}
