'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuAboutTeamTabPanel } from './contenu-about-team-tab-panel';

export function ContenuAProposEquipePageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/equipe">
      <ContenuAboutTeamTabPanel />
    </AdminIntroPage>
  );
}
