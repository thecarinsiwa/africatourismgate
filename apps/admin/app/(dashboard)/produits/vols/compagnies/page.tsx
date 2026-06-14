import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { AirlinesList } from '../../../../../components/flights/airlines-list';
import { FlightsStatCards } from '../../../../../components/flights/flights-stat-cards';

export const metadata: Metadata = {
  title: 'Compagnies aériennes — Africa Tourism Gate Admin',
};

export default function CompagniesPage() {
  return (
    <div>
      <AdminPageIntro
        backHref="/produits/vols"
        backLabel="Retour aux vols"
        description="Référentiel des compagnies (code IATA 2 lettres)."
      />
      <FlightsStatCards className="mb-6" />
      <AirlinesList />
    </div>
  );
}
