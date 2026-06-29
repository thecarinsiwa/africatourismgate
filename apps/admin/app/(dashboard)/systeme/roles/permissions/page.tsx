import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PermissionsPageContent } from '../../../../../components/pages/systeme-roles-permissions-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/roles/permissions');
}

export default function Page() {
  return <PermissionsPageContent />;
}
