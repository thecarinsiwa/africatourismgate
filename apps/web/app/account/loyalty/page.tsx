import type { Metadata } from 'next';
import { AccountLoyaltyPanel } from '../../../components/account/account-loyalty-panel';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'loyalty', '/account/loyalty');
}

export default function AccountLoyaltyPage() {
  return <AccountLoyaltyPanel />;
}
