import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { ContenuBlogNouveauPageContent } from '../../../../../components/pages/contenu-blog-nouveau-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/blog/nouveau');
}

export default function Page() {
  return <ContenuBlogNouveauPageContent />;
}
