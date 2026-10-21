'use client';

import { AdminListPageHeader } from './admin-list-page-header';
import { TreasuryAuditLogsList } from '../treasury/treasury-audit-logs-list';

export function TresorerieAuditPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="tresorerie/audit" />
      <TreasuryAuditLogsList />
    </div>
  );
}
