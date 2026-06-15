import type { Metadata } from 'next';
import { Button, PageHeader } from '@africatourismgate/ui';
import { DestinationsList } from '../../../../components/destinations/destinations-list';

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
      <DestinationsList />
    </div>
  );
}
