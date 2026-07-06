'use client';

import { AboutPageForm } from '../about/about-page-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposPagesNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/pages/nouveau">
      <AboutPageForm mode="create" />
    </AdminIntroPage>
  );
}
