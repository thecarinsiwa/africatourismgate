'use client';

import { TeamMembersList } from '../about/team-members-list';
import { AboutStatCards } from '../about/about-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposEquipePageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/equipe">
      <AboutStatCards className="mb-6" section="team" />
      <TeamMembersList />
    </AdminIntroPage>
  );
}
