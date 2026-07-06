'use client';

import { TeamMemberForm } from '../about/team-member-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposEquipeNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/equipe/nouveau">
      <TeamMemberForm mode="create" />
    </AdminIntroPage>
  );
}
