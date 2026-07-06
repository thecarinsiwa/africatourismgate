'use client';

import { TimelineMilestoneForm } from '../about/timeline-milestone-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposTimelineNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/timeline/nouveau">
      <TimelineMilestoneForm mode="create" />
    </AdminIntroPage>
  );
}
