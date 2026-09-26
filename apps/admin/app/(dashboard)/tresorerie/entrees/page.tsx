import type { Metadata } from 'next';
import { TresorerieEntreesPageContent } from '../../../../components/pages/tresorerie-entrees-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/entrees');
}

export default function TresorerieEntreesPage() {
  return <TresorerieEntreesPageContent />;
}
