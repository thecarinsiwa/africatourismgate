import type { Metadata } from 'next';
import { GapImpactNouveauPageContent } from '../../../../../components/pages/gap-impact-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/impact/nouveau');
}

export default function Page() {
  return <GapImpactNouveauPageContent />;
}
