import type { Metadata } from 'next';
import { SystemeDevisesPageContent } from '../../../../components/pages/systeme-devises-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/devises');
}

export default function SystemeDevisesPage() {
  return <SystemeDevisesPageContent />;
}
