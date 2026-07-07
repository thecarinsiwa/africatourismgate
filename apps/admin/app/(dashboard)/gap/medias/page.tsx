import type { Metadata } from 'next';
import { GapMediasPageContent } from '../../../../components/pages/gap-medias-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/medias');
}

export default function Page() {
  return <GapMediasPageContent />;
}
