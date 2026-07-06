'use client';

import { AboutResourcesList } from '../about/about-resources-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposRessourcesPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/ressources">
      <AboutResourcesList />
    </AdminIntroPage>
  );
}
