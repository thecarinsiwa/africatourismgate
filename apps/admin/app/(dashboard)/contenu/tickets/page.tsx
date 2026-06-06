import type { Metadata } from 'next';
import { SupportTicketsList } from '../../../../components/support/support-tickets-list';

export const metadata: Metadata = {
  title: 'Tickets support — Africa Tourism Gate Admin',
};

export default function SupportTicketsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Tickets support</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Demandes d’assistance clients. Filtres par statut et priorité. Accès :
          support_tickets.read / support_tickets.write.
        </p>
      </div>
      <SupportTicketsList />
    </div>
  );
}
