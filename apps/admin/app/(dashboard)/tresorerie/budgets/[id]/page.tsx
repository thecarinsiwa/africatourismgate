import type { Metadata } from 'next';
import { BudgetEditPage } from '../../../../../components/treasury/budget-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/budgets/id');
}

export default function TresorerieBudgetEditPage({ params }: PageProps) {
  return <BudgetEditPage budgetId={params.id} />;
}
