'use client';

import { FundEntryForm } from '../treasury/fund-entry-form';
import { AdminIntroPage } from './admin-intro-page';

export function TresorerieEntreesNouveauPageContent() {
  return (
    <div className="min-w-0">
      <AdminIntroPage
        routePath="tresorerie/entrees/nouveau"
        backHref="/tresorerie/entrees"
        backLabelKey="backLabel"
      >
        <FundEntryForm mode="create" />
      </AdminIntroPage>
    </div>
  );
}
