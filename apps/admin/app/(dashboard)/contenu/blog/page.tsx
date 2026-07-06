import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { ContenuBlogPageContent } from '../../../../components/pages/contenu-blog-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/blog');
}

export default function Page() {
  return <ContenuBlogPageContent />;
}
