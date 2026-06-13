import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { RolesList } from '../../../../components/rbac/roles-list';

export const metadata: Metadata = {
  title: 'Rôles et permissions — Africa Tourism Gate Admin',
};

export default function RolesPage() {
  return (
    <div>
      <AdminPageIntro description={"Gérez les rôles, la matrice des permissions et les assignations utilisateurs."} />
      <RolesList />
    </div>
  );
}
