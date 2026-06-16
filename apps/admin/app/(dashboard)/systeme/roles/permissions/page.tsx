import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { PermissionsList } from '../../../../../components/rbac/permissions-list';

export const metadata: Metadata = {
  title: 'Permissions — Africa Tourism Gate Admin',
};

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader
        title="Catalogue des permissions"
        description="Liste en lecture seule des permissions disponibles sur la plateforme."
      />
      <PermissionsList />
    </div>
  );
}
