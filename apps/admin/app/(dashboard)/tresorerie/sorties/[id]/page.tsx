import type { Metadata } from 'next';
import { FundExitEditPage } from '../../../../../components/treasury/fund-exit-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/sorties/id');
}

export default function TresorerieSortieEditPage({ params }: PageProps) {
  return <FundExitEditPage fundExitId={params.id} />;
}
