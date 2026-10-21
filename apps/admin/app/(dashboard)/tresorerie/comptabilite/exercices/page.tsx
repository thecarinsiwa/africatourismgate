import type { Metadata } from 'next';
import { TresorerieComptabiliteExercicesPageContent } from '../../../../../components/pages/tresorerie-comptabilite-exercices-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/exercices');
}

export default function TresorerieComptabiliteExercicesPage() {
  return <TresorerieComptabiliteExercicesPageContent />;
}
