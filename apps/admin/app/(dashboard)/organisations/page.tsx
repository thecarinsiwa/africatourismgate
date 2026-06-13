import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { OrganizationsList } from '../../../components/organizations/organizations-list';

export const metadata: Metadata = {
  title: 'Organisations — Africa Tourism Gate Admin',
};

export default function OrganisationsPage() {
  return (
    <div>
      <AdminPageIntro description={"Partenaires et entités de la plateforme. Recherche par nom ou slug."} />
      <OrganizationsList />
    </div>
  );
}
