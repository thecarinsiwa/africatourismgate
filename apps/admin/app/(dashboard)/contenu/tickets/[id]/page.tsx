import type { Metadata } from 'next';
import { SupportTicketDetailPage } from '../../../../../components/support/support-ticket-detail-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Détail ticket — Africa Tourism Gate Admin',
};

export default function SupportTicketDetailRoutePage({ params }: PageProps) {
  return <SupportTicketDetailPage ticketId={params.id} />;
}
