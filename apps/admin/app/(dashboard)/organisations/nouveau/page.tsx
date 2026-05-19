import type { Metadata } from 'next';
import { OrganizationForm } from '../../../../components/organizations/organization-form';

export const metadata: Metadata = {
  title: 'Nouvelle organisation — Africa Tourism Gate Admin',
};

export default function NouvelleOrganisationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvelle organisation</h1>
        <p className="mt-2 text-sm text-atg-muted">Créer une organisation partenaire.</p>
      </div>
      <OrganizationForm mode="create" />
    </div>
  );
}
