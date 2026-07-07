'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapPagesList } from '../gap/gap-pages-list';
import { AdminIntroPage } from './admin-intro-page';

export function GapPagesPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/pages">
        <GapPagesList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
