import type { Metadata } from 'next';
import { BudgetViewPage } from '../../../../../../components/treasury/budget-view-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/budgets/id/voir');
}

export default function TresorerieBudgetViewPage({ params }: PageProps) {
  return <BudgetViewPage budgetId={params.id} />;
}
