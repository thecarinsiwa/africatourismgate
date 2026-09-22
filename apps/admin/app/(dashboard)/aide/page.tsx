import type { Metadata } from 'next';
import { AidePageContent } from '../../../components/pages/aide-page-content';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('aide');
}

export default function AidePage() {
  return <AidePageContent />;
}
