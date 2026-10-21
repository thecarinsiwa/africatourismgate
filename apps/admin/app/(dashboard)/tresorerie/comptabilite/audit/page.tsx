import type { Metadata } from 'next';
import { TresorerieComptabiliteAuditPageContent } from '../../../../../components/pages/tresorerie-comptabilite-audit-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/audit');
}

export default function TresorerieComptabiliteAuditPage() {
  return <TresorerieComptabiliteAuditPageContent />;
}
