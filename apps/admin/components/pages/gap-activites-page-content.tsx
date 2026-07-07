'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapActivitiesList } from '../gap/gap-activities-list';
import { AdminIntroPage } from './admin-intro-page';

export function GapActivitesPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/activites">
        <GapActivitiesList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
