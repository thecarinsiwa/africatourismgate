import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { RbacAuditLogsList } from '../../../../components/rbac/rbac-audit-logs-list';

export const metadata: Metadata = {
  title: 'Audit RBAC — Africa Tourism Gate Admin',
};

export default function RbacAuditPage() {
  return (
    <div>
      <PageHeader
        title="Audit RBAC"
        description="Journal des événements de sécurité et des changements de permissions (lecture seule)."
      />
      <RbacAuditLogsList />
    </div>
  );
}
