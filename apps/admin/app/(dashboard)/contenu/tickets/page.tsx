import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { SupportTicketsList } from '../../../../components/support/support-tickets-list';

export const metadata: Metadata = {
  title: 'Tickets support — Africa Tourism Gate Admin',
};

export default function SupportTicketsPage() {
  return (
    <div>
      <AdminPageIntro description="Demandes d'assistance clients. Filtres par statut et priorité. Accès : support_tickets.read / support_tickets.write." />
      <SupportTicketsList />
    </div>
  );
}
