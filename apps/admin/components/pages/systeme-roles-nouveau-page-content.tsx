'use client';

import { RoleForm } from '../rbac/role-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauRolePageContent() {
  return (
    <AdminIntroPage
      routePath="systeme/roles/nouveau"
      backHref="/systeme/roles"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <RoleForm mode="create" />
      </div>
    </AdminIntroPage>
  );
}
