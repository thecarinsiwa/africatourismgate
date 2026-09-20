'use client';

import { LegalPageForm } from '../legal/legal-page-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuLegalNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/legal/nouveau" backHref="/contenu/legal" backLabelKey="backLabel">
      <LegalPageForm mode="create" />
    </AdminIntroPage>
  );
}
