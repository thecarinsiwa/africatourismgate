'use client';

import { BudgetVsActualPanel } from '../treasury/budget-vs-actual-panel';
import { AdminIntroPage } from './admin-intro-page';

export function TresorerieBudgetsSuiviPageContent() {
  return (
    <div className="min-w-0">
      <AdminIntroPage
        routePath="tresorerie/budgets/suivi"
        backHref="/tresorerie/budgets"
        backLabelKey="backLabel"
      >
        <BudgetVsActualPanel />
      </AdminIntroPage>
    </div>
  );
}
