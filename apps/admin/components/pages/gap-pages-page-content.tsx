'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapPagesList } from '../gap/gap-pages-list';
import { GapPagesStatCards } from '../gap/gap-pages-stat-cards';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapPagesPageContent() {
  const t = useTranslations('pages.gap.pages');
  const { canWrite } = useGapPermissions();

  return (
    <GapAccessShell>
      <div className="min-w-0">
        <AdminListPageHeader
          routePath="gap/pages"
          actions={
            canWrite ? <Button href="/gap/pages/nouveau">{t('actions.new')}</Button> : null
          }
        />
        <GapPagesStatCards className="mb-6" />
        <GapPagesList />
      </div>
    </GapAccessShell>
  );
}
