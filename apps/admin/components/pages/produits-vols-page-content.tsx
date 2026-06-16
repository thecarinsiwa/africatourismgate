'use client';

import { FlightsList } from '../flights/flights-list';
import { FlightsStatCards } from '../flights/flights-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function VolsPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/vols"
      links={[
        { href: '/produits/vols/compagnies', labelKey: 'links.airlines' },
        { href: '/produits/vols/aeroports', labelKey: 'links.airports' },
      ]}
    >
      <FlightsStatCards className="mb-6" />
      <FlightsList />
    </AdminIntroPage>
  );
}
