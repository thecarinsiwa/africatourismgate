import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { UserRoleAssignmentsList } from '../../../../../components/rbac/user-role-assignments-list';

export const metadata: Metadata = {
  title: 'Assignations de rôles — Africa Tourism Gate Admin',
};

export default function AssignationsPage() {
  return (
    <div>
      <PageHeader
        title="Assignations de rôles"
        description="Attribuer ou révoquer des rôles pour les utilisateurs (tous périmètres)."
      />
      <UserRoleAssignmentsList />
    </div>
  );
}
