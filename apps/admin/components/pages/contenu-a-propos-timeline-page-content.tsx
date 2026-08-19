'use client';

import { TimelineMilestonesList } from '../about/timeline-milestones-list';
import { AboutStatCards } from '../about/about-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposTimelinePageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/timeline">
      <AboutStatCards className="mb-6" section="timeline" />
      <TimelineMilestonesList />
    </AdminIntroPage>
  );
}
