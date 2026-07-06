import type { Metadata } from 'next';
import { TeamMemberEditPage } from '../../../../../../components/about/team-member-edit-page';
import { getAdminPageMetadata } from '../../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('contenu/a-propos/equipe/id');
}

export default function Page({ params }: PageProps) {
  return <TeamMemberEditPage memberId={params.id} />;
}
