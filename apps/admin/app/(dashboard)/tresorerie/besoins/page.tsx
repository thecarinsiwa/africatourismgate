import type { Metadata } from 'next';
import { TresorerieBesoinsPageContent } from '../../../../components/pages/tresorerie-besoins-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/besoins');
}

export default function TresorerieBesoinsPage() {
  return <TresorerieBesoinsPageContent />;
}
