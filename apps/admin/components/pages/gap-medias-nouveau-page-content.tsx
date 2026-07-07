'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapMediaItemForm } from '../gap/gap-media-item-form';
import { AdminIntroPage } from './admin-intro-page';

export function GapMediasNouveauPageContent() {
  return (
    <GapAccessShell requireWrite>
      <AdminIntroPage routePath="gap/medias/nouveau">
        <GapMediaItemForm mode="create" />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
