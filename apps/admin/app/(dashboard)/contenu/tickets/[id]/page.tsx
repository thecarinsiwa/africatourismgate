import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { SupportTicketDetailPage } from '../../../../../components/support/support-ticket-detail-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/tickets/id');
}

export default function SupportTicketDetailRoutePage({ params }: PageProps) {
  return <SupportTicketDetailPage ticketId={params.id} />;
}
