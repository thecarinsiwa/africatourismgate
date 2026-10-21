import type { Metadata } from 'next';
import { FundEntryEditPage } from '../../../../../components/treasury/fund-entry-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/entrees/id');
}

export default function TresorerieEntreeEditPage({ params }: PageProps) {
  return <FundEntryEditPage fundEntryId={params.id} />;
}
