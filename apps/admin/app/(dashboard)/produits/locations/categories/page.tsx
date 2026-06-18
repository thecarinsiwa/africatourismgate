import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { CategoriesVehiculesPageContent } from '../../../../../components/pages/produits-locations-categories-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/locations/categories');
}

export default function Page() {
  return <CategoriesVehiculesPageContent />;
}
