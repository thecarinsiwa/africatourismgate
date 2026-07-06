import type { Metadata } from 'next';
import { ContenuPourquoiNousPageContent } from '../../../../components/pages/contenu-pourquoi-nous-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/pourquoi-nous');
}

export default function Page() {
  return <ContenuPourquoiNousPageContent />;
}
