'use client';

import { GapAccessShell } from '../gap/gap-access-shell';
import { GapPageEditPage } from '../gap/gap-page-edit-page';
import { AdminIntroPage } from './admin-intro-page';

type GapPagesIdPageContentProps = {
  id: string;
};

export function GapPagesIdPageContent({ id }: GapPagesIdPageContentProps) {
  return (
    <GapAccessShell>
      <AdminIntroPage
        routePath="gap/pages/id"
        backHref="/gap/pages"
        backLabelKey="backLabel"
      >
        <GapPageEditPage pageId={id} />
      </AdminIntroPage>
    </GapAccessShell>
  );
}
