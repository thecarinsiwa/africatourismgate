'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapActivitiesList } from '../gap/gap-activities-list';
import { GapActivitiesStatCards } from '../gap/gap-activities-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function GapActivitesPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/activites">
        <GapActivitiesStatCards className="mb-6" />
        <GapActivitiesList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
