import type { Metadata } from 'next';
import { TresorerieBudgetsSuiviPageContent } from '../../../../../components/pages/tresorerie-budgets-suivi-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/budgets/suivi');
}

export default function TresorerieBudgetsSuiviPage() {
  return <TresorerieBudgetsSuiviPageContent />;
}
