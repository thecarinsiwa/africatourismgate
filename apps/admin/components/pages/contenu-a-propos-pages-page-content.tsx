'use client';

import { AboutPagesList } from '../about/about-pages-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposPagesPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/pages">
      <AboutPagesList />
    </AdminIntroPage>
  );
}
