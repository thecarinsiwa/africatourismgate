'use client';

import { AdminListPageHeader } from './admin-list-page-header';
import { TreasuryReportsPanel } from '../treasury/treasury-reports-panel';

export function TresorerieRapportsPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="tresorerie/rapports" />
      <TreasuryReportsPanel />
    </div>
  );
}
