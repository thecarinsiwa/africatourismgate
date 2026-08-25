'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapActivityEditPage } from '../gap/gap-activity-edit-page';
import { AdminIntroPage } from './admin-intro-page';

type GapActivitesIdPageContentProps = {
  id: string;
};

export function GapActivitesIdPageContent({ id }: GapActivitesIdPageContentProps) {
  return (
    <GapAccessShell>
      <AdminIntroPage
        routePath="gap/activites/id"
        backHref="/gap/activites"
        backLabelKey="backLabel"
      >
        <GapActivityEditPage activityId={id} />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
