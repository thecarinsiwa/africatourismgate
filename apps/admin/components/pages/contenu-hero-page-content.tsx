'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuHeroTabPanel } from './contenu-hero-tab-panel';

export function ContenuHeroPageContent() {
  return (
    <AdminIntroPage routePath="contenu/hero">
      <ContenuHeroTabPanel />
    </AdminIntroPage>
  );
}
