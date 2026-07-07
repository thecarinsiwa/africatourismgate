'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapMediaItemsList } from '../gap/gap-media-items-list';
import { AdminIntroPage } from './admin-intro-page';

export function GapMediasPageContent() {
  return (
    <GapAccessShell>
      <AdminIntroPage routePath="gap/medias">
        <GapMediaItemsList />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
