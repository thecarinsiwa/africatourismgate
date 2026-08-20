'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapImpactStatForm } from '../gap/gap-impact-stat-form';
import { AdminIntroPage } from './admin-intro-page';

export function GapImpactNouveauPageContent() {
  return (
    <GapAccessShell requireWrite>
      <AdminIntroPage
        routePath="gap/impact/nouveau"
        backHref="/gap/impact"
        backLabelKey="backLabel"
      >
        <GapImpactStatForm mode="create" />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
