import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { GuidesNouveauPageContent } from '../../../../components/pages/guides-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('guides/nouveau');
}

export default function Page() {
  return <GuidesNouveauPageContent />;
}
