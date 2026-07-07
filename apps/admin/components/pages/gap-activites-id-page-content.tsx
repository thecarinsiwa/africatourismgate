'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapActivityEditPage } from '../gap/gap-activity-edit-page';

type GapActivitesIdPageContentProps = {
  id: string;
};

export function GapActivitesIdPageContent({ id }: GapActivitesIdPageContentProps) {
  return (
    <GapAccessShell>
      <GapActivityEditPage activityId={id} />
    </GapAccessShell>
  );
}
