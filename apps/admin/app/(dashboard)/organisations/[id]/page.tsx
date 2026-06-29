import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { OrganizationDetailPage } from '../../../../components/organizations/organization-detail-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('organisations/id');
}

export default function EditOrganisationPage({ params }: PageProps) {
  return <OrganizationDetailPage organizationId={params.id} />;
}
