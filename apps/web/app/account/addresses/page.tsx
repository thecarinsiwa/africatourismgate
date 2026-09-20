import type { Metadata } from 'next';
import { AccountAddressesPanel } from '../../../components/account/account-addresses-panel';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'addresses', '/account/addresses');
}

export default function AccountAddressesPage() {
  return <AccountAddressesPanel />;
}
