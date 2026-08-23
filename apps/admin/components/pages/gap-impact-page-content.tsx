'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapImpactStatCards } from '../gap/gap-impact-stat-cards';
import { GapImpactStatsList } from '../gap/gap-impact-stats-list';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapImpactPageContent() {
  const t = useTranslations('pages.gap.impact');
  const { canWrite } = useGapPermissions();

  return (
    <GapAccessShell>
      <div className="min-w-0">
        <AdminListPageHeader
          routePath="gap/impact"
          actions={
            canWrite ? <Button href="/gap/impact/nouveau">{t('actions.new')}</Button> : null
          }
        />
        <GapImpactStatCards className="mb-6" />
        <GapImpactStatsList />
      </div>
    </GapAccessShell>
  );
}
