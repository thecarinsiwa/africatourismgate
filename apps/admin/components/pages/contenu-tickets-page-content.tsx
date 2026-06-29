'use client';

import { SupportTicketsList } from '../support/support-tickets-list';
import { AdminIntroPage } from './admin-intro-page';

export function TicketsPageContent() {
  return (
    <AdminIntroPage routePath="contenu/tickets">
      <SupportTicketsList />
    </AdminIntroPage>
  );
}
