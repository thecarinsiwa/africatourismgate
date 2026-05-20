import type { Metadata } from 'next';
import { DestinationForm } from '../../../../../components/destinations/destination-form';

export const metadata: Metadata = {
  title: 'Nouvelle destination — Africa Tourism Gate Admin',
};

export default function NouvelleDestinationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvelle destination</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Créez la destination puis ajoutez des points d’intérêt sur la page de modification.
        </p>
      </div>
      <DestinationForm mode="create" />
    </div>
  );
}
