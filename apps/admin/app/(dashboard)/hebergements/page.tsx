import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { HebergementsPageContent } from '../../../components/pages/hebergements-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('hebergements');
}

export default function Page() {
  return <HebergementsPageContent />;
}
