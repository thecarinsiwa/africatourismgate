'use client';

import { useSearchParams } from 'next/navigation';
import { FundExitForm } from '../treasury/fund-exit-form';
import { AdminIntroPage } from './admin-intro-page';

export function TresorerieSortiesNouveauPageContent() {
  const searchParams = useSearchParams();
  const expenseRequestId = searchParams.get('expenseRequestId') ?? undefined;

  return (
    <div className="min-w-0">
      <AdminIntroPage
        routePath="tresorerie/sorties/nouveau"
        backHref="/tresorerie/sorties"
        backLabelKey="backLabel"
      >
        <FundExitForm
          mode="create"
          initialExpenseRequestId={expenseRequestId}
        />
      </AdminIntroPage>
    </div>
  );
}
