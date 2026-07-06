'use client';

import { TimelineMilestonesList } from '../about/timeline-milestones-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposTimelinePageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/timeline">
      <TimelineMilestonesList />
    </AdminIntroPage>
  );
}
