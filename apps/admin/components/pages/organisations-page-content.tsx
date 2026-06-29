'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { OrganizationsList } from '../organizations/organizations-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function OrganisationsPageContent() {
  const tNav = useTranslations('nav.links');
  return (
    <div>
      <AdminListPageHeader
        routePath="organisations"
        actions={
          <Button href="/organisations/nouveau" variant="primary">
            {tNav('newOrganization')}
          </Button>
        }
      />
      <OrganizationsList />
    </div>
  );
}
