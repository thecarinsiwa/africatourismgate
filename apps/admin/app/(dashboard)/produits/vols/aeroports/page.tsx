import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { AirportsList } from '../../../../../components/flights/airports-list';
import { FlightsStatCards } from '../../../../../components/flights/flights-stat-cards';

export const metadata: Metadata = {
  title: 'Aéroports — Africa Tourism Gate Admin',
};

export default function AeroportsPage() {
  return (
    <div>
      <AdminPageIntro
        backHref="/produits/vols"
        backLabel="Retour aux vols"
        description="Référentiel des aéroports (code IATA 3 lettres)."
      />
      <FlightsStatCards className="mb-6" />
      <AirportsList />
    </div>
  );
}
