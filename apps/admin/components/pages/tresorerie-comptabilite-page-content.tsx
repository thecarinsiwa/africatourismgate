'use client';

import { AccountingBridgeNotice } from '../treasury/accounting-bridge-notice';
import { AccountingLinksList } from '../treasury/accounting-links-list';
import { AdminListPageHeader } from './admin-list-page-header';

/**
 * Placeholder Comptabilité (TRESO-040) — liens stub uniquement, pas de SYSCOHADA.
 */
export function TresorerieComptabilitePageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AdminListPageHeader routePath="tresorerie/comptabilite" />
      <AccountingBridgeNotice />
      <AccountingLinksList />
    </div>
  );
}
