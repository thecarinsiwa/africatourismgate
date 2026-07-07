'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapImpactStatsList } from '../gap/gap-impact-stats-list';
import { AdminIntroPage } from './admin-intro-page';

export function GapImpactPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/impact">
        <GapImpactStatsList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
