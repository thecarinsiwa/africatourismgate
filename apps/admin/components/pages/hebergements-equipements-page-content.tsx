'use client';

import { AmenitiesList } from '../amenities/amenities-list';
import { AdminIntroPage } from './admin-intro-page';

export function EquipementsPageContent() {
  return (
    <AdminIntroPage routePath="hebergements/equipements">
      <AmenitiesList />
    </AdminIntroPage>
  );
}
