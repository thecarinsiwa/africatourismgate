'use client';

import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { AccountingBridgeNotice } from '../treasury/accounting-bridge-notice';
import { AccountingLinksList } from '../treasury/accounting-links-list';
import { AdminListPageHeader } from './admin-list-page-header';

/**
 * Hub Comptabilité SYSCOHADA — pont accounting_links + livres (SYSCO-006).
 */
export function TresorerieComptabilitePageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite" />
      <AccountingBridgeNotice />
      <AccountingLinksList />
    </div>
  );
}
