'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapActivityForm } from '../gap/gap-activity-form';
import { AdminIntroPage } from './admin-intro-page';

export function GapActivitesNouveauPageContent() {
  return (
    <GapAccessShell requireWrite>
      <AdminIntroPage
        routePath="gap/activites/nouveau"
        backHref="/gap/activites"
        backLabelKey="backLabel"
      >
        <GapActivityForm mode="create" />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
