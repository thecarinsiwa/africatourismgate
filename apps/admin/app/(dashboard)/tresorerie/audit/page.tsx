import type { Metadata } from 'next';
import { TresorerieAuditPageContent } from '../../../../components/pages/tresorerie-audit-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/audit');
}

export default function TresorerieAuditPage() {
  return <TresorerieAuditPageContent />;
}
