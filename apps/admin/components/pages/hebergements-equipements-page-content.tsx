'use client';

import { AmenitiesList } from '../amenities/amenities-list';
import { PropertiesStatCards } from '../properties/properties-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function EquipementsPageContent() {
  return (
    <AdminIntroPage routePath="hebergements/equipements">
      <PropertiesStatCards className="mb-6" />
      <AmenitiesList />
    </AdminIntroPage>
  );
}
