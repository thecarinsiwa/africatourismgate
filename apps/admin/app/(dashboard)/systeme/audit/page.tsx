import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { AuditPageContent } from '../../../../components/pages/systeme-audit-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/audit');
}

export default function Page() {
  return <AuditPageContent />;
}
