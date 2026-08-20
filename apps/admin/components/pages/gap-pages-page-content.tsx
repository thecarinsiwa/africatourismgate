'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapPagesList } from '../gap/gap-pages-list';
import { GapPagesStatCards } from '../gap/gap-pages-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function GapPagesPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/pages">
        <GapPagesStatCards className="mb-6" />
        <GapPagesList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
