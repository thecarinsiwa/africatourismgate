import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';
import { getAdminSectionByPath } from '../../../config/admin-sections.registry';

type PageProps = {
  params: { segments: string[] };
};

export function generateMetadata({ params }: PageProps): Metadata {
  const section = getAdminSectionByPath(params.segments);
  if (!section) {
    return { title: 'Section introuvable — Africa Tourism Gate Admin' };
  }
  return {
    title: `${section.title} — Africa Tourism Gate Admin`,
  };
}

/** Routes avec pages dédiées (ne pas servir via ce catch-all). */
const RESERVED_ROOT_SEGMENTS = new Set([
  'dashboard',
  'parametres',
  'organisations',
  'utilisateurs',
  'systeme',
]);

export default function AdminSectionPage({ params }: PageProps) {
  if (params.segments[0] && RESERVED_ROOT_SEGMENTS.has(params.segments[0])) {
    notFound();
  }

  const section = getAdminSectionByPath(params.segments);
  if (!section) {
    notFound();
  }

  return (
    <DashboardSectionPage title={section.title} description={section.description} />
  );
}
