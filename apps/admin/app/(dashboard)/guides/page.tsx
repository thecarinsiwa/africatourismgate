import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { GuidesPageContent } from '../../../components/pages/guides-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('guides');
}

export default function Page() {
  return <GuidesPageContent />;
}
