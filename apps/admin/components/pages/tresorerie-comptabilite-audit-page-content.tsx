'use client';

import { AccountingAuditLogsList } from '../treasury/accounting-audit-logs-list';
import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieComptabiliteAuditPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="tresorerie/comptabilite/audit" />
      <AccountingBooksSubnav />
      <AccountingAuditLogsList />
    </div>
  );
}
