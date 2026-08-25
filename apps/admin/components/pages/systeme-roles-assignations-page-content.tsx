'use client';

import { UserRoleAssignmentsList } from '../rbac/user-role-assignments-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AssignationsPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="systeme/roles/assignations" />
      <UserRoleAssignmentsList />
    </div>
  );
}
