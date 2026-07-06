import type { Metadata } from 'next';
import { WhyUsItemEditPage } from '../../../../../components/why-us/why-us-item-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/pourquoi-nous');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <WhyUsItemEditPage itemId={id} />;
}
