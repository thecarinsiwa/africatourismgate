'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuHappyCustomersTabPanel } from './contenu-happy-customers-tab-panel';

export function ContenuClientsSatisfaitsPageContent() {
  return (
    <AdminIntroPage routePath="contenu/clients-satisfaits">
      <ContenuHappyCustomersTabPanel />
    </AdminIntroPage>
  );
}
