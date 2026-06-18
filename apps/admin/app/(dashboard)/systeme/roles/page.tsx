import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { RolesPageContent } from '../../../../components/pages/systeme-roles-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/roles');
}

export default function Page() {
  return <RolesPageContent />;
}
