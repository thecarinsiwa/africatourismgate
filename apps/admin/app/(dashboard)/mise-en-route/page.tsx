import type { Metadata } from 'next';
import { SetupGuidePageContent } from '../../../components/setup-guide/setup-guide-page-content';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('mise-en-route');
}

export default function MiseEnRoutePage() {
  return <SetupGuidePageContent />;
}
