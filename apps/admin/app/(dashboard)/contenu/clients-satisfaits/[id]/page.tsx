import type { Metadata } from 'next';
import { HappyCustomersStatEditPage } from '../../../../../components/happy-customers/happy-customers-stat-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/clients-satisfaits/id');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <HappyCustomersStatEditPage statId={id} />;
}
