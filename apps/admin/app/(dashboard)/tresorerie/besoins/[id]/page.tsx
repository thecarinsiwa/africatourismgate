import type { Metadata } from 'next';
import { ExpenseRequestEditPage } from '../../../../../components/treasury/expense-request-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/besoins/id');
}

export default function TresorerieBesoinEditPage({ params }: PageProps) {
  return <ExpenseRequestEditPage expenseRequestId={params.id} />;
}
