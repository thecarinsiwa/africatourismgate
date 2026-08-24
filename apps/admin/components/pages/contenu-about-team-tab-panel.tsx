'use client';

import { AboutStatCards } from '../about/about-stat-cards';
import { TeamMembersList } from '../about/team-members-list';

export function ContenuAboutTeamTabPanel() {
  return (
    <>
      <AboutStatCards className="mb-6" section="team" />
      <TeamMembersList />
    </>
  );
}
