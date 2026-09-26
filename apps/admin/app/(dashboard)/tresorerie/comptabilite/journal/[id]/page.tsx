import type { Metadata } from 'next';
import { TresorerieComptabiliteJournalDetailPageContent } from '../../../../../../components/pages/tresorerie-comptabilite-journal-detail-page-content';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type Props = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/journal/id');
}

export default function TresorerieComptabiliteJournalDetailPage({
  params,
}: Props) {
  return <TresorerieComptabiliteJournalDetailPageContent entryId={params.id} />;
}
