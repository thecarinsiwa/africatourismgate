import type { Metadata } from 'next';
import { GapPagesPageContent } from '../../../../components/pages/gap-pages-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/pages');
}

export default function Page() {
  return <GapPagesPageContent />;
}
