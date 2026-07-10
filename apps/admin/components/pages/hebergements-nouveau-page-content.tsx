'use client';

import { PropertyForm } from '../properties/property-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelHebergementPageContent() {
  return (
    <AdminIntroPage
      routePath="hebergements/nouveau"
      backHref="/hebergements"
      backLabelKey="backLabel"
    >
      <PropertyForm mode="create" />
    </AdminIntroPage>
  );
}
