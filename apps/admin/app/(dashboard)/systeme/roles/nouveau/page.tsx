import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { NouveauRolePageContent } from '../../../../../components/pages/systeme-roles-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/roles/nouveau');
}

export default function Page() {
  return <NouveauRolePageContent />;
}
