import type { Metadata } from 'next';
import { GapMediasNouveauPageContent } from '../../../../../components/pages/gap-medias-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/medias/nouveau');
}

export default function Page() {
  return <GapMediasNouveauPageContent />;
}
