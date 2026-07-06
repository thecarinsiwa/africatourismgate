'use client';

import { HappyCustomersStatForm } from '../happy-customers/happy-customers-stat-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuClientsSatisfaitsNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/clients-satisfaits/nouveau">
      <HappyCustomersStatForm mode="create" />
    </AdminIntroPage>
  );
}
