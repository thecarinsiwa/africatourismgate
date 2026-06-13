import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { OrganizationForm } from '../../../../components/organizations/organization-form';

export const metadata: Metadata = {
  title: 'Nouvelle organisation — Africa Tourism Gate Admin',
};

export default function NouvelleOrganisationPage() {
  return (
    <div>
      <AdminPageIntro description={"Créer une organisation partenaire."} />
      <OrganizationForm mode="create" />
    </div>
  );
}
