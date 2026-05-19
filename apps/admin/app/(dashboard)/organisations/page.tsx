import type { Metadata } from 'next';
import { OrganizationsList } from '../../../components/organizations/organizations-list';

export const metadata: Metadata = {
  title: 'Organisations — Africa Tourism Gate Admin',
};

export default function OrganisationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Organisations</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Partenaires et entités de la plateforme. Recherche par nom ou slug.
        </p>
      </div>
      <OrganizationsList />
    </div>
  );
}
