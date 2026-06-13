import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { UserRoleAssignmentsList } from '../../../../../components/rbac/user-role-assignments-list';

export const metadata: Metadata = {
  title: 'Assignations de rôles — Africa Tourism Gate Admin',
};

export default function AssignationsPage() {
  return (
    <div>
      <AdminPageIntro description={"Attribuer ou révoquer des rôles pour les utilisateurs (tous périmètres)."} />
      <UserRoleAssignmentsList />
    </div>
  );
}
