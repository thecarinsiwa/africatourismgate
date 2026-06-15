import type { Metadata } from 'next';
import { Button, PageHeader } from '@africatourismgate/ui';
import { DestinationsList } from '../../../../components/destinations/destinations-list';
import { DestinationsStatCards } from '../../../../components/destinations/destinations-stat-cards';

export const metadata: Metadata = {
  title: 'Destinations — Africa Tourism Gate Admin',
};

export default function DestinationsPage() {
  return (
    <div>
      <PageHeader
        title="Destinations"
        description="Géographie et points d'intérêt. Recherche par nom, slug ou code pays."
        actions={<Button href="/produits/destinations/nouveau">Nouvelle destination</Button>}
      />
      <DestinationsStatCards className="mb-6" />
      <DestinationsList />
    </div>
  );
}
