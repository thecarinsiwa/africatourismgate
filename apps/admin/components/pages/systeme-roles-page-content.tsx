'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { RolesList } from '../rbac/roles-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function RolesPageContent() {
  const t = useTranslations('pages.systeme.roles');
  return (
    <div>
      <AdminListPageHeader
        routePath="systeme/roles"
        actions={<Button href="/systeme/roles/nouveau">{t('actions.new')}</Button>}
      />
      <RolesList />
    </div>
  );
}
