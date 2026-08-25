'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuAboutResourcesTabPanel } from './contenu-about-resources-tab-panel';

export function ContenuAProposRessourcesPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/ressources">
      <ContenuAboutResourcesTabPanel />
    </AdminIntroPage>
  );
}
