import type { Metadata } from 'next';
import { TresorerieBudgetsNouveauPageContent } from '../../../../../components/pages/tresorerie-budgets-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/budgets/nouveau');
}

export default function TresorerieBudgetsNouveauPage() {
  return <TresorerieBudgetsNouveauPageContent />;
}
