import type { Metadata } from 'next';
import { TresorerieBudgetsPageContent } from '../../../../components/pages/tresorerie-budgets-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/budgets');
}

export default function TresorerieBudgetsPage() {
  return <TresorerieBudgetsPageContent />;
}
