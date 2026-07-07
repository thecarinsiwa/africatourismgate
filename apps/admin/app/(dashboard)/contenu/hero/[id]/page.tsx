import type { Metadata } from 'next';
import { HeroSlideEditPage } from '../../../../../components/hero-slides/hero-slide-edit-page';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/hero');
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <HeroSlideEditPage slideId={id} />;
}
