'use client';

import { AboutPagesList } from '../about/about-pages-list';
import { AboutStatCards } from '../about/about-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposPagesPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/pages">
      <AboutStatCards className="mb-6" section="pages" />
      <AboutPagesList />
    </AdminIntroPage>
  );
}
