'use client';

import { LegalPagesList } from '../legal/legal-pages-list';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuLegalPageContent() {
  return (
    <AdminIntroPage routePath="contenu/legal">
      <LegalPagesList />
    </AdminIntroPage>
  );
}
