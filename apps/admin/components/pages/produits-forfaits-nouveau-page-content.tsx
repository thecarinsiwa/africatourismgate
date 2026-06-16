'use client';

import { PackageForm } from '../packages/package-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauForfaitPageContent() {
  return (
    <AdminIntroPage routePath="produits/forfaits/nouveau">
      <PackageForm mode="create" />
    </AdminIntroPage>
  );
}
