import type { Metadata } from 'next';
import { FundEntryViewPage } from '../../../../../../components/treasury/fund-entry-view-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/entrees/id/voir');
}

export default function TresorerieEntreeViewPage({ params }: PageProps) {
  return <FundEntryViewPage fundEntryId={params.id} />;
}
