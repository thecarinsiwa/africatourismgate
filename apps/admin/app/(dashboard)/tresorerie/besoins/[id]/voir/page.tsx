import type { Metadata } from 'next';
import { ExpenseRequestViewPage } from '../../../../../../components/treasury/expense-request-view-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/besoins/id/voir');
}

export default function TresorerieBesoinViewPage({ params }: PageProps) {
  return <ExpenseRequestViewPage expenseRequestId={params.id} />;
}
