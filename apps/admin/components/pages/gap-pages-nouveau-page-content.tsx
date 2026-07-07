'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapPageForm } from '../gap/gap-page-form';
import { AdminIntroPage } from './admin-intro-page';

export function GapPagesNouveauPageContent() {
  return (
    <GapAccessShell requireWrite>
      <AdminIntroPage routePath="gap/pages/nouveau">
        <GapPageForm mode="create" />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
