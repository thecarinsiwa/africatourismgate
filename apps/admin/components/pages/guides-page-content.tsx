'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { TourGuidesList } from '../tour-guides/tour-guides-list';
import { TourGuidesStatCards } from '../tour-guides/tour-guides-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function GuidesPageContent() {
  const t = useTranslations('pages.guides');
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('guides.write'));
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="guides"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/guides/calendrier" variant="outline">
              {t('actions.calendar')}
            </Button>
            {canWrite ? (
              <Button href="/guides/nouveau" variant="primary">
                {t('actions.new')}
              </Button>
            ) : null}
          </div>
        }
      />
      <TourGuidesStatCards className="mb-6" />
      <TourGuidesList />
    </div>
  );
}
