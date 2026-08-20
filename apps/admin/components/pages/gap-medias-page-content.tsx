'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapMediaItemsList } from '../gap/gap-media-items-list';
import { GapMediaStatCards } from '../gap/gap-media-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function GapMediasPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/medias">
        <GapMediaStatCards className="mb-6" />
        <GapMediaItemsList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
