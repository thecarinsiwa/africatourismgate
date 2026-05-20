import type { Metadata } from 'next';
import { UserRoleAssignmentsList } from '../../../../../components/rbac/user-role-assignments-list';

export const metadata: Metadata = {
  title: 'Assignations de rôles — Africa Tourism Gate Admin',
};

export default function AssignationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Assignations de rôles</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Attribuer ou révoquer des rôles pour les utilisateurs (tous périmètres).
        </p>
      </div>
      <UserRoleAssignmentsList />
    </div>
  );
}
