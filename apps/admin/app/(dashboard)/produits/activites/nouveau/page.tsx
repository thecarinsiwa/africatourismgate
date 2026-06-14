import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { AdminPageBackLink } from '../../../../../components/admin-page-back-link';
import { ActivityForm } from '../../../../../components/activities/activity-form';

export const metadata: Metadata = {
  title: 'Nouvelle activité — Africa Tourism Gate Admin',
};

export default function NouvelleActivitePage() {
  return (
    <div>
      <PageHeader
        title="Nouvelle activité"
        description="Créez une expérience puis ajoutez des créneaux sur la page d'édition."
        breadcrumb={
          <AdminPageBackLink href="/produits/activites" label="Retour aux activités" />
        }
      />
      <ActivityForm mode="create" />
    </div>
  );
}
