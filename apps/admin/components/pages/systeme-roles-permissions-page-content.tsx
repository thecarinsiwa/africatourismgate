'use client';

import { PermissionsList } from '../rbac/permissions-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function PermissionsPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/roles/permissions" />
      <PermissionsList />
    </div>
  );
}
