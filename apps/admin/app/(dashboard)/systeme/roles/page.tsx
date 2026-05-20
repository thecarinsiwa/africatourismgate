import type { Metadata } from 'next';
import { RolesList } from '../../../../components/rbac/roles-list';

export const metadata: Metadata = {
  title: 'Rôles et permissions — Africa Tourism Gate Admin',
};

export default function RolesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Rôles et permissions</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Gérez les rôles, la matrice des permissions et les assignations utilisateurs.
        </p>
      </div>
      <RolesList />
    </div>
  );
}
