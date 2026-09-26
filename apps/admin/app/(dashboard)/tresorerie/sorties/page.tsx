import type { Metadata } from 'next';
import { TresorerieStubPageContent } from '../../../../../components/pages/tresorerie-stub-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/sorties');
}

export default function TresorerieSortiesPage() {
  return <TresorerieStubPageContent routePath="tresorerie/sorties" />;
}
