import type { Metadata } from 'next';
import { ShipForm } from '../../../../../../components/cruises/ship-form';

export const metadata: Metadata = {
  title: 'Nouveau navire — Africa Tourism Gate Admin',
};

export default function NouveauNavirePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau navire</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Créez un navire puis ajoutez itinéraires et cabines.
        </p>
      </div>
      <ShipForm mode="create" />
    </div>
  );
}
