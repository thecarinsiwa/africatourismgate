'use client';

import { TeamMembersList } from '../about/team-members-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposEquipePageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/equipe">
      <TeamMembersList />
    </AdminIntroPage>
  );
}
