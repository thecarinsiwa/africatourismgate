import type { Metadata } from 'next';
import { RoleForm } from '../../../../../components/rbac/role-form';

export const metadata: Metadata = {
  title: 'Nouveau rôle — Africa Tourism Gate Admin',
};

export default function NouveauRolePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau rôle</h1>
        <p className="mt-2 text-sm text-atg-muted">Créer un rôle personnalisé.</p>
      </div>
      <RoleForm mode="create" />
    </div>
  );
}
