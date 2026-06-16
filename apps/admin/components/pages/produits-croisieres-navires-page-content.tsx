'use client';

import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { ShipsList } from '../cruises/ships-list';
import { AdminIntroPage } from './admin-intro-page';

export function NaviresPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/croisieres/navires"
      links={[{ href: '/produits/croisieres', labelKey: 'links.backToSailings' }]}
    >
      <CruisesStatCards className="mb-6" />
      <ShipsList />
    </AdminIntroPage>
  );
}
