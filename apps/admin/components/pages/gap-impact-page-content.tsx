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
      <div className="relative min-w-0 pb-20 sm:pb-0">
        <AdminListPageHeader
          routePath="gap/impact"
          actions={
            canWrite ? (
              <Button href="/gap/impact/nouveau" className="hidden sm:inline-flex">
                {t('actions.new')}
              </Button>
            ) : null
          }
        />
        <GapImpactStatCards className="mb-6" />
        <GapImpactStatsList />

        {canWrite ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 sm:hidden">
            <div className="pointer-events-auto mx-auto max-w-lg">
              <Button href="/gap/impact/nouveau" fullWidth size="lg">
                {t('actions.new')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </GapAccessShell>
  );
}
