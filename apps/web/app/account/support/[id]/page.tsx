import type { Metadata } from 'next';
import { AccountSupportTicketDetail } from '../../../../components/account/account-support-ticket-detail';
import { buildPrivatePageMetadata } from '../../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
};

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return buildPrivatePageMetadata(
    'account',
    'supportDetail',
    `/account/support/${params.id}`,
  );
}

export default function AccountSupportTicketPage({ params }: PageProps) {
  return <AccountSupportTicketDetail ticketId={params.id} />;
}
