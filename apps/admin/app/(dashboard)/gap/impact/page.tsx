import type { Metadata } from 'next';
import { GapImpactPageContent } from '../../../../components/pages/gap-impact-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/impact');
}

export default function Page() {
  return <GapImpactPageContent />;
}
