import type { Metadata } from 'next';
import { PermissionsList } from '../../../../../components/rbac/permissions-list';

export const metadata: Metadata = {
  title: 'Permissions — Africa Tourism Gate Admin',
};

export default function PermissionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Permissions</h1>
      </div>
      <PermissionsList />
    </div>
  );
}
