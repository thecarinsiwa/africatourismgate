import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { RbacAuditLogsList } from '../../../../components/rbac/rbac-audit-logs-list';

export const metadata: Metadata = {
  title: 'Audit RBAC — Africa Tourism Gate Admin',
};

export default function RbacAuditPage() {
  return (
    <div>
      <AdminPageIntro description={"Journal des événements de sécurité et des changements de permissions (lecture seule)."} />
      <RbacAuditLogsList />
    </div>
  );
}
