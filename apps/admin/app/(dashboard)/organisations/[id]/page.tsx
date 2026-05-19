import type { Metadata } from 'next';
import { OrganizationEditPage } from '../../../../components/organizations/organization-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’organisation — Africa Tourism Gate Admin',
};

export default function EditOrganisationPage({ params }: PageProps) {
  return <OrganizationEditPage organizationId={params.id} />;
}
