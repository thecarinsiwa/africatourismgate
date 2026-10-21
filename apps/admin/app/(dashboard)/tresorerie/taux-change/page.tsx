import type { Metadata } from 'next';
import { TresorerieTauxChangePageContent } from '../../../../components/pages/tresorerie-taux-change-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/taux-change');
}

export default function TresorerieTauxChangePage() {
  return <TresorerieTauxChangePageContent />;
}
