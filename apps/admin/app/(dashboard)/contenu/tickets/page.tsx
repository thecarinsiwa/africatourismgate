import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { TicketsPageContent } from '../../../../components/pages/contenu-tickets-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/tickets');
}

export default function Page() {
  return <TicketsPageContent />;
}
