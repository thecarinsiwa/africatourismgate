import type { Metadata } from 'next';
import { GapPagesNouveauPageContent } from '../../../../../components/pages/gap-pages-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/pages/nouveau');
}

export default function Page() {
  return <GapPagesNouveauPageContent />;
}
