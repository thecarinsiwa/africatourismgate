'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuWhyUsTabPanel } from './contenu-why-us-tab-panel';

export function ContenuPourquoiNousPageContent() {
  return (
    <AdminIntroPage routePath="contenu/pourquoi-nous">
      <ContenuWhyUsTabPanel />
    </AdminIntroPage>
  );
}
