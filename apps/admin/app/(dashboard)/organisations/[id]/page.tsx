import type { Metadata } from 'next';
import { OrganizationDetailPage } from '../../../../components/organizations/organization-detail-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’organisation — Africa Tourism Gate Admin',
};

export default function EditOrganisationPage({ params }: PageProps) {
  return <OrganizationDetailPage organizationId={params.id} />;
}
