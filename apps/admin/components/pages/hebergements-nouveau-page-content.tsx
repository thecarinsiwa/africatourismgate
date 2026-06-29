'use client';

import { PropertyForm } from '../properties/property-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelHebergementPageContent() {
  return (
    <AdminIntroPage routePath="hebergements/nouveau">
      <PropertyForm mode="create" />
    </AdminIntroPage>
  );
}
