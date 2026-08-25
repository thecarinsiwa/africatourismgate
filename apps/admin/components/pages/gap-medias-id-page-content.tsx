'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapMediaItemEditPage } from '../gap/gap-media-item-edit-page';
import { AdminIntroPage } from './admin-intro-page';

type GapMediasIdPageContentProps = {
  id: string;
};

export function GapMediasIdPageContent({ id }: GapMediasIdPageContentProps) {
  return (
    <GapAccessShell>
      <AdminIntroPage
        routePath="gap/medias/id"
        backHref="/gap/medias"
        backLabelKey="backLabel"
      >
        <GapMediaItemEditPage mediaItemId={id} />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
