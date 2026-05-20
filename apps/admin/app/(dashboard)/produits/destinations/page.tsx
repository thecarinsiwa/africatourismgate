import type { Metadata } from 'next';
import { DestinationsList } from '../../../../components/destinations/destinations-list';

export const metadata: Metadata = {
  title: 'Destinations — Africa Tourism Gate Admin',
};

export default function DestinationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Destinations</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Géographie et points d’intérêt. Recherche par nom, slug ou code pays.
        </p>
      </div>
      <DestinationsList />
    </div>
  );
}
