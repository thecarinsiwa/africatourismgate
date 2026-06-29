import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { EquipementsPageContent } from '../../../../components/pages/hebergements-equipements-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('hebergements/equipements');
}

export default function Page() {
  return <EquipementsPageContent />;
}
