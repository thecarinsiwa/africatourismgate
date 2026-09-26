import type { Metadata } from 'next';
import { FundExitViewPage } from '../../../../../../components/treasury/fund-exit-view-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/sorties/id/voir');
}

export default function TresorerieSortieViewPage({ params }: PageProps) {
  return <FundExitViewPage fundExitId={params.id} />;
}
