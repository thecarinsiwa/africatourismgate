import type { Metadata } from 'next';
import { GapParametresPageContent } from '../../../../components/pages/gap-parametres-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('gap/parametres');
}

export default function Page() {
  return <GapParametresPageContent />;
}
