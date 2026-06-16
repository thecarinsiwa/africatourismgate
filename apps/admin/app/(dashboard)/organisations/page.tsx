import type { Metadata } from 'next';
import { Button, PageHeader } from '@africatourismgate/ui';
import { OrganizationsList } from '../../../components/organizations/organizations-list';

export const metadata: Metadata = {
  title: 'Organisations — Africa Tourism Gate Admin',
};

export default function OrganisationsPage() {
  return (
    <div>
      <PageHeader
        title="Organisations"
        description="Partenaires et entités de la plateforme. Recherche par nom ou slug."
        actions={<Button href="/organisations/nouveau">Nouvelle organisation</Button>}
      />
      <OrganizationsList />
    </div>
  );
}
