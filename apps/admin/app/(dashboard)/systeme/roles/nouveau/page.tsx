import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { RoleForm } from '../../../../../components/rbac/role-form';

export const metadata: Metadata = {
  title: 'Nouveau rôle — Africa Tourism Gate Admin',
};

export default function NouveauRolePage() {
  return (
    <div>
      <PageHeader
        title="Nouveau rôle"
        description="Créer un rôle personnalisé et définir ses permissions."
      />
      <RoleForm mode="create" />
    </div>
  );
}
