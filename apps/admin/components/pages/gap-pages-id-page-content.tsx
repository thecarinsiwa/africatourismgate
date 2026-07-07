'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapPageEditPage } from '../gap/gap-page-edit-page';

type GapPagesIdPageContentProps = {
  id: string;
};

export function GapPagesIdPageContent({ id }: GapPagesIdPageContentProps) {
  return (
    <GapAccessShell>
      <GapPageEditPage pageId={id} />
    </GapAccessShell>
  );
}
