'use client';

import { AboutResourcesList } from '../about/about-resources-list';
import { AboutStatCards } from '../about/about-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposRessourcesPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/ressources">
      <AboutStatCards className="mb-6" section="resources" />
      <AboutResourcesList />
    </AdminIntroPage>
  );
}
