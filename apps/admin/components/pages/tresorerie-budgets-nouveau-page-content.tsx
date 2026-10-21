'use client';

import { BudgetForm } from '../treasury/budget-form';
import { AdminIntroPage } from './admin-intro-page';

export function TresorerieBudgetsNouveauPageContent() {
  return (
    <div className="min-w-0">
      <AdminIntroPage
        routePath="tresorerie/budgets/nouveau"
        backHref="/tresorerie/budgets"
        backLabelKey="backLabel"
      >
        <BudgetForm mode="create" />
      </AdminIntroPage>
    </div>
  );
}
