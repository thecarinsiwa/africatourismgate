'use client';

import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { SailingsList } from '../cruises/sailings-list';
import { AdminIntroPage } from './admin-intro-page';

export function CroisieresPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/croisieres"
      links={[
        { href: '/produits/croisieres/lignes', labelKey: 'links.lines' },
        { href: '/produits/croisieres/ports', labelKey: 'links.ports' },
        { href: '/produits/croisieres/navires', labelKey: 'links.ships' },
      ]}
    >
      <CruisesStatCards className="mb-6" />
      <SailingsList />
    </AdminIntroPage>
  );
}
