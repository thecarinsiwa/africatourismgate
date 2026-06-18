import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { PortsCroisierePageContent } from '../../../../../components/pages/produits-croisieres-ports-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/ports');
}

export default function Page() {
  return <PortsCroisierePageContent />;
}
