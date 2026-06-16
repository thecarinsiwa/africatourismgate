'use client';

import { RbacAuditLogsList } from '../rbac/rbac-audit-logs-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AuditPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/audit" />
      <RbacAuditLogsList />
    </div>
  );
}
