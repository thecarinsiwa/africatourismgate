'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapMediaItemEditPage } from '../gap/gap-media-item-edit-page';

type GapMediasIdPageContentProps = {
  id: string;
};

export function GapMediasIdPageContent({ id }: GapMediasIdPageContentProps) {
  return (
    <GapAccessShell>
      <GapMediaItemEditPage mediaItemId={id} />
    </GapAccessShell>
  );
}
