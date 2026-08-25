'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuAboutPagesTabPanel } from './contenu-about-pages-tab-panel';

export function ContenuAProposPagesPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/pages">
      <ContenuAboutPagesTabPanel />
    </AdminIntroPage>
  );
}
