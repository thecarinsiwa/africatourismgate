import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';
import { getAdminSectionByPath } from '../../../config/admin-sections.registry';
import { getPlaceholderSectionMessages } from '../../../lib/placeholder-section-i18n';

type PageProps = {
  params: { segments: string[] };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tPlaceholder = await getTranslations('placeholderSections');
  const section = getAdminSectionByPath(params.segments);

  if (!section) {
    return { title: tPlaceholder('meta.notFoundTitle') };
  }

  const tNav = await getTranslations('nav');
  const messages = getPlaceholderSectionMessages({
    sectionPath: params.segments.join('/'),
    tPlaceholder,
    tNav,
  });

  return {
    title: `${messages.title} — ${tPlaceholder('meta.titleSuffix')}`,
    description: messages.description,
  };
}

/** Routes avec pages dédiées (ne pas servir via ce catch-all). */
const RESERVED_ROOT_SEGMENTS = new Set([
  'dashboard',
  'parametres',
  'organisations',
  'utilisateurs',
  'systeme',
  'hebergements',
  'paiements',
  'reservations',
  'fidelite',
  'guides',
]);

export default function AdminSectionPage({ params }: PageProps) {
  if (params.segments[0] && RESERVED_ROOT_SEGMENTS.has(params.segments[0])) {
    notFound();
  }

  const section = getAdminSectionByPath(params.segments);
  if (!section) {
    notFound();
  }

  return <DashboardSectionPage segments={params.segments} />;
}
