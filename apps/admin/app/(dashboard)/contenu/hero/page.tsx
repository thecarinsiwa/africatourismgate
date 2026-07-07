import type { Metadata } from 'next';
import { ContenuHeroPageContent } from '../../../../components/pages/contenu-hero-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/hero');
}

export default function Page() {
  return <ContenuHeroPageContent />;
}
