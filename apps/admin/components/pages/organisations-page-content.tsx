'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { OrganizationsList } from '../organizations/organizations-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function OrganisationsPageContent() {
  const t = useTranslations('pages.organisations');
  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="organisations"
        actions={
          <Button href="/organisations/nouveau" variant="primary">
            {t('actions.new')}
          </Button>
        }
      />
      <OrganizationsList />
    </div>
  );
}
