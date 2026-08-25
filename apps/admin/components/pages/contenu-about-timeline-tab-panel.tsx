'use client';

import { AboutStatCards } from '../about/about-stat-cards';
import { TimelineMilestonesList } from '../about/timeline-milestones-list';

export function ContenuAboutTimelineTabPanel() {
  return (
    <>
      <AboutStatCards className="mb-6" section="timeline" />
      <TimelineMilestonesList />
    </>
  );
}
