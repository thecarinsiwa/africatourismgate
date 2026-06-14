import type { Metadata } from 'next';
import { Button, PageHeader } from '@africatourismgate/ui';
import { ActivitiesList } from '../../../../components/activities/activities-list';
import { ActivitiesStatCards } from '../../../../components/activities/activities-stat-cards';

export const metadata: Metadata = {
  title: 'Activités — Africa Tourism Gate Admin',
};

export default function ActivitesPage() {
  return (
    <div>
      <PageHeader
        title="Activités & tours"
        description="Expériences, fournisseurs et créneaux par destination."
        actions={
          <>
            <Button href="/produits/activites/fournisseurs" variant="outline">
              Fournisseurs
            </Button>
            <Button href="/produits/activites/nouveau">Nouvelle activité</Button>
          </>
        }
      />
      <ActivitiesStatCards className="mb-6" />
      <ActivitiesList />
    </div>
  );
}
