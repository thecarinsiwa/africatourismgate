import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { RoleForm } from '../../../../../components/rbac/role-form';

export const metadata: Metadata = {
  title: 'Nouveau rôle — Africa Tourism Gate Admin',
};

export default function NouveauRolePage() {
  return (
    <div>
      <AdminPageIntro description={"Créer un rôle personnalisé."} />
      <RoleForm mode="create" />
    </div>
  );
}
