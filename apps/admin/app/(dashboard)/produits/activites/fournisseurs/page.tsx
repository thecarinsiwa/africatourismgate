import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { AdminPageBackLink } from '../../../../../components/admin-page-back-link';
import { ActivityProvidersList } from '../../../../../components/activities/activity-providers-list';

export const metadata: Metadata = {
  title: 'Fournisseurs d’activités — Africa Tourism Gate Admin',
};

export default function ActivitesFournisseursPage() {
  return (
    <div>
      <PageHeader
        title="Fournisseurs d'activités"
        description="Opérateurs liés aux destinations."
        breadcrumb={
          <AdminPageBackLink href="/produits/activites" label="Retour aux activités" />
        }
      />
      <ActivityProvidersList />
    </div>
  );
}
