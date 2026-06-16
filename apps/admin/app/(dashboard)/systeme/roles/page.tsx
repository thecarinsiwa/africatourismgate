import type { Metadata } from 'next';
import { Button, PageHeader } from '@africatourismgate/ui';
import { RolesList } from '../../../../components/rbac/roles-list';

export const metadata: Metadata = {
  title: 'Rôles et permissions — Africa Tourism Gate Admin',
};

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Rôles et permissions"
        description="Gérez les rôles, la matrice des permissions et les assignations utilisateurs."
        actions={<Button href="/systeme/roles/nouveau">Nouveau rôle</Button>}
      />
      <RolesList />
    </div>
  );
}
