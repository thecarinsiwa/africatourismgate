'use client';

import { AboutResourceForm } from '../about/about-resource-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAProposRessourcesNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/a-propos/ressources/nouveau">
      <AboutResourceForm mode="create" />
    </AdminIntroPage>
  );
}
