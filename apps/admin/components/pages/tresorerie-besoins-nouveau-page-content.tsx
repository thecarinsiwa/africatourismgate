'use client';

import { ExpenseRequestForm } from '../treasury/expense-request-form';
import { AdminIntroPage } from './admin-intro-page';

export function TresorerieBesoinsNouveauPageContent() {
  return (
    <div className="min-w-0">
      <AdminIntroPage
        routePath="tresorerie/besoins/nouveau"
        backHref="/tresorerie/besoins"
        backLabelKey="backLabel"
      >
        <ExpenseRequestForm mode="create" />
      </AdminIntroPage>
    </div>
  );
}
