'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { GapAccessShell } from '../gap/gap-access-shell';
import { GapActivitiesList } from '../gap/gap-activities-list';
import { GapActivitiesStatCards } from '../gap/gap-activities-stat-cards';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { AdminListPageHeader } from './admin-list-page-header';

export function GapActivitesPageContent() {
  const t = useTranslations('pages.gap.activites');
  const { canWrite } = useGapPermissions();

  return (
    <GapAccessShell>
      <div className="min-w-0">
        <AdminListPageHeader
          routePath="gap/activites"
          actions={
            canWrite ? (
              <Button href="/gap/activites/nouveau">{t('actions.new')}</Button>
            ) : null
          }
        />
        <GapActivitiesStatCards className="mb-6" />
        <GapActivitiesList />
      </div>
    </GapAccessShell>
  );
}
