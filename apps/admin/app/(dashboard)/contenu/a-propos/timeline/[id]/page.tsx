import type { Metadata } from 'next';
import { TimelineMilestoneEditPage } from '../../../../../../components/about/timeline-milestone-edit-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/timeline/id');
}

export default function Page({ params }: PageProps) {
  return <TimelineMilestoneEditPage milestoneId={params.id} />;
}
