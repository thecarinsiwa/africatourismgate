'use client';

import { AirportsList } from '../flights/airports-list';
import { AdminIntroPage } from './admin-intro-page';

export function AeroportsPageContent() {
  return (
    <AdminIntroPage routePath="produits/vols/aeroports" backHref="/produits/vols" backLabelKey="backLabel">
      <AirportsList />
    </AdminIntroPage>
  );
}
