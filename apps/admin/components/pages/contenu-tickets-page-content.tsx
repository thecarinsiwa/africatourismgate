'use client';

import { AdminIntroPage } from './admin-intro-page';
import { ContenuTicketsTabPanel } from './contenu-tickets-tab-panel';

export function TicketsPageContent() {
  return (
    <AdminIntroPage routePath="contenu/tickets">
      <ContenuTicketsTabPanel />
    </AdminIntroPage>
  );
}
