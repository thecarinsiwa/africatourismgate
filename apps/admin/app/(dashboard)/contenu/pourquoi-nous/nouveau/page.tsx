import type { Metadata } from 'next';
import { ContenuPourquoiNousNouveauPageContent } from '../../../../../components/pages/contenu-pourquoi-nous-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/pourquoi-nous/nouveau');
}

export default function Page() {
  return <ContenuPourquoiNousNouveauPageContent />;
}
