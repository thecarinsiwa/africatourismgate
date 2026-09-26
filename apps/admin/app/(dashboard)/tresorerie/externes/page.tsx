import type { Metadata } from 'next';
import { TresorerieExternesPageContent } from '../../../../components/pages/tresorerie-externes-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/externes');
}

export default function TresorerieExternesPage() {
  return <TresorerieExternesPageContent />;
}
