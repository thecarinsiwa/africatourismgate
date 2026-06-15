import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { FlightsList } from '../../../../components/flights/flights-list';
import { FlightsStatCards } from '../../../../components/flights/flights-stat-cards';

export const metadata: Metadata = {
  title: 'Vols — Africa Tourism Gate Admin',
};

export default function VolsPage() {
  return (
    <div>
      <AdminPageIntro
        description="Catalogue des vols, classes cabine et disponibilités. Recherche par code vol."
        links={[
          { href: '/produits/vols/compagnies', label: 'Compagnies aériennes' },
          { href: '/produits/vols/aeroports', label: 'Aéroports' },
        ]}
      />
      <FlightsStatCards className="mb-6" />
      <FlightsList />
    </div>
  );
}
