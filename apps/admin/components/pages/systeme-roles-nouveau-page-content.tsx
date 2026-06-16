'use client';

import { RoleForm } from '../rbac/role-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouveauRolePageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/roles/nouveau" titleKey="metaTitle" />
      <RoleForm mode="create" />
    </div>
  );
}
