import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { RbacAuditLogsList } from '../../../../components/rbac/rbac-audit-logs-list';

export const metadata: Metadata = {
  title: 'Journaux de sécurité — Africa Tourism Gate Admin',
};

export default function UtilisateurJournauxSecuritePage() {
  return (
    <div>
      <AdminPageIntro description={"Événements de sécurité et audit d&apos;accès."} />
      <RbacAuditLogsList showSubnav={false} />
    </div>
  );
}
