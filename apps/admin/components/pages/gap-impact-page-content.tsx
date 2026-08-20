'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapImpactStatCards } from '../gap/gap-impact-stat-cards';
import { GapImpactStatsList } from '../gap/gap-impact-stats-list';
import { AdminIntroPage } from './admin-intro-page';

export function GapImpactPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/impact">
        <GapImpactStatCards className="mb-6" />
        <GapImpactStatsList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
