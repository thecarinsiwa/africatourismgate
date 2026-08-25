'use client';

import { PermissionsList } from '../rbac/permissions-list';
import { PermissionsStatCards } from '../rbac/permissions-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function PermissionsPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="systeme/roles/permissions" />
      <PermissionsStatCards className="mb-6" />
      <PermissionsList />
    </div>
  );
}
