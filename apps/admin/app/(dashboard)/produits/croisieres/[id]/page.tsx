import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { SailingEditPage } from '../../../../../components/cruises/sailing-edit-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('produits/croisieres/id');
}

type PageProps = { params: { id: string } };

export default function DepartEditPage({ params }: PageProps) {
  return <SailingEditPage sailingId={params.id} />;
}
