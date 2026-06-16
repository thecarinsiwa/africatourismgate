'use client';

import { RbacAuditLogsList } from '../rbac/rbac-audit-logs-list';
import { AdminIntroPage } from './admin-intro-page';

export function JournauxSecuritePageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/journaux-securite">
      <RbacAuditLogsList showSubnav={false} />
    </AdminIntroPage>
  );
}
