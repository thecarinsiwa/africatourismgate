'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { RolesList } from '../rbac/roles-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function RolesPageContent() {
  const t = useTranslations('pages.systeme.roles');
  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="systeme/roles"
        actions={
          <Button href="/systeme/roles/nouveau" variant="primary">
            {t('actions.new')}
          </Button>
        }
      />
      <RolesList />
    </div>
  );
}
