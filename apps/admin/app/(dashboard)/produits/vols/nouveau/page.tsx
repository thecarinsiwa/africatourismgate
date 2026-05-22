import type { Metadata } from 'next';
import { FlightForm } from '../../../../../components/flights/flight-form';

export const metadata: Metadata = {
  title: 'Nouveau vol — Africa Tourism Gate Admin',
};

export default function NouveauVolPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau vol</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Définissez le trajet, puis ajoutez les classes cabine sur la fiche vol.
        </p>
      </div>
      <FlightForm mode="create" />
    </div>
  );
}
