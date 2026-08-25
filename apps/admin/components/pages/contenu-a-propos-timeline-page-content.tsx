'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuAboutTimelineTabPanel } from './contenu-about-timeline-tab-panel';

export function ContenuAProposTimelinePageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/timeline">
      <ContenuAboutTimelineTabPanel />
    </AdminIntroPage>
  );
}
