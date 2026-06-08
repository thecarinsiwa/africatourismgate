import type { Metadata } from 'next';
import { RbacAuditLogsList } from '../../../../components/rbac/rbac-audit-logs-list';

export const metadata: Metadata = {
  title: 'Journaux de sécurité — Africa Tourism Gate Admin',
};

export default function UtilisateurJournauxSecuritePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Journaux de sécurité</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Événements de sécurité et audit d&apos;accès.
        </p>
      </div>
      <RbacAuditLogsList showSubnav={false} />
    </div>
  );
}
