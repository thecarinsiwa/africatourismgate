'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { TourGuidesList } from '../tour-guides/tour-guides-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function GuidesPageContent() {
  const t = useTranslations('pages.guides');
  return (
    <div>
      <AdminListPageHeader
        routePath="guides"
        actions={
          <Button href="/guides/nouveau" variant="primary">
            {t('actions.new')}
          </Button>
        }
      />
      <TourGuidesList />
    </div>
  );
}
