import type { Metadata } from 'next';
import { SailingForm } from '../../../../../components/cruises/sailing-form';

export const metadata: Metadata = {
  title: 'Nouveau départ — Africa Tourism Gate Admin',
};

export default function NouveauDepartPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau départ</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Associez un itinéraire existant à une date de départ.
        </p>
      </div>
      <SailingForm mode="create" />
    </div>
  );
}
