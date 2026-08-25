import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { OrganizationViewPage } from '../../../../../components/organizations/organization-view-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('organisations/id/voir');
}

export default function ViewOrganisationPage({ params }: PageProps) {
  return <OrganizationViewPage organizationId={params.id} />;
}
