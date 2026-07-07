'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapImpactStatEditPage } from '../gap/gap-impact-stat-edit-page';

type GapImpactIdPageContentProps = {
  id: string;
};

export function GapImpactIdPageContent({ id }: GapImpactIdPageContentProps) {
  return (
    <GapAccessShell>
      <GapImpactStatEditPage statId={id} />
    </GapAccessShell>
  );
}
