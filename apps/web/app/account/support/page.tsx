import type { Metadata } from 'next';
import { AccountSupportList } from '../../../components/account/account-support-list';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'support', '/account/support');
}

export default function AccountSupportPage() {
  return <AccountSupportList />;
}
