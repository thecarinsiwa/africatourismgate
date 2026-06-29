import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { NouvelHebergementPageContent } from '../../../../components/pages/hebergements-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('hebergements/nouveau');
}

export default function Page() {
  return <NouvelHebergementPageContent />;
}
