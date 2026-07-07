import type { Metadata } from 'next';
import { ContenuHeroNouveauPageContent } from '../../../../../components/pages/contenu-hero-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/hero/nouveau');
}

export default function Page() {
  return <ContenuHeroNouveauPageContent />;
}
