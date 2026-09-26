import type { Metadata } from 'next';
import { TresorerieComptabiliteJournalPageContent } from '../../../../../components/pages/tresorerie-comptabilite-journal-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/journal');
}

export default function TresorerieComptabiliteJournalPage() {
  return <TresorerieComptabiliteJournalPageContent />;
}
