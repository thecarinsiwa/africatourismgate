import type { Metadata } from 'next';
import { RbacAuditLogsList } from '../../../../components/rbac/rbac-audit-logs-list';

export const metadata: Metadata = {
  title: 'Audit RBAC — Africa Tourism Gate Admin',
};

export default function RbacAuditPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Audit RBAC</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Journal des événements de sécurité et des changements de permissions (lecture seule).
        </p>
      </div>
      <RbacAuditLogsList />
    </div>
  );
}
