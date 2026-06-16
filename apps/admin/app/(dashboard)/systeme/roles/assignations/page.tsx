import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { AssignationsPageContent } from '../../../../../components/pages/systeme-roles-assignations-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/roles/assignations');
}

export default function Page() {
  return <AssignationsPageContent />;
}
