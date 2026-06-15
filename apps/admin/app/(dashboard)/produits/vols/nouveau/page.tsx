import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { FlightForm } from '../../../../../components/flights/flight-form';

export const metadata: Metadata = {
  title: 'Nouveau vol — Africa Tourism Gate Admin',
};

export default function NouveauVolPage() {
  return (
    <div>
      <AdminPageIntro
        backHref="/produits/vols"
        backLabel="Retour aux vols"
        description="Définissez le trajet, puis ajoutez les classes cabine sur la fiche vol."
      />
      <FlightForm mode="create" />
    </div>
  );
}
