'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapMediaItemsList } from '../gap/gap-media-items-list';
import { GapMediaStatCards } from '../gap/gap-media-stat-cards';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapMediasPageContent() {
  const t = useTranslations('pages.gap.medias');
  const { canWrite } = useGapPermissions();

  return (
    <GapAccessShell>
      <div className="min-w-0">
        <AdminListPageHeader
          routePath="gap/medias"
          actions={
            canWrite ? <Button href="/gap/medias/nouveau">{t('actions.new')}</Button> : null
          }
        />
        <GapMediaStatCards className="mb-6" />
        <GapMediaItemsList />
      </div>
    </GapAccessShell>
  );
}
