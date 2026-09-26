'use client';

import { TresorerieHubQuickLinks } from '../treasury/tresorerie-hub-quick-links';
import { TresorerieStatCards } from '../treasury/tresorerie-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

/**
 * Hub Trésorerie (TRESO-038) — KPI légers + accès rapide aux sous-modules.
 */
export function TresorerieHubPageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AdminListPageHeader routePath="tresorerie" />
      <TresorerieStatCards />
      <TresorerieHubQuickLinks />
    </div>
  );
}
