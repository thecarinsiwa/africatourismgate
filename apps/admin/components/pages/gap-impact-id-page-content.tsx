'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapImpactStatEditPage } from '../gap/gap-impact-stat-edit-page';
import { AdminIntroPage } from './admin-intro-page';

type GapImpactIdPageContentProps = {
  id: string;
};

export function GapImpactIdPageContent({ id }: GapImpactIdPageContentProps) {
  return (
    <GapAccessShell>
      <AdminIntroPage
        routePath="gap/impact/id"
        backHref="/gap/impact"
        backLabelKey="backLabel"
      >
        <GapImpactStatEditPage statId={id} />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
