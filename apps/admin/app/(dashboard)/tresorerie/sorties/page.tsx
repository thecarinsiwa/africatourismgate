import type { Metadata } from 'next';
import { TresorerieSortiesPageContent } from '../../../../components/pages/tresorerie-sorties-page-content';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/sorties');
}

export default function TresorerieSortiesPage() {
  return <TresorerieSortiesPageContent />;
}
