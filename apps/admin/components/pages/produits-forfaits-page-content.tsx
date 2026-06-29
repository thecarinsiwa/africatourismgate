'use client';

import { PackagesList } from '../packages/packages-list';
import { PackagesStatCards } from '../packages/packages-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ForfaitsPageContent() {
  return (
    <AdminIntroPage routePath="produits/forfaits">
      <PackagesStatCards className="mb-6" />
      <PackagesList />
    </AdminIntroPage>
  );
}
