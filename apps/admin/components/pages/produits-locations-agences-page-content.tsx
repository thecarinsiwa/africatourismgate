'use client';

import { RentalAgenciesList } from '../locations/rental-agencies-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AgencesLocationPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/locations/agences" />
      <RentalAgenciesList />
    </div>
  );
}
