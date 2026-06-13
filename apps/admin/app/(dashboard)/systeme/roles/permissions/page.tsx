import type { Metadata } from 'next';
import { PermissionsList } from '../../../../../components/rbac/permissions-list';

export const metadata: Metadata = {
  title: 'Permissions — Africa Tourism Gate Admin',
};

export default function PermissionsPage() {
  return (
    <div>
      
      <PermissionsList />
    </div>
  );
}
