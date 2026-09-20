import type { Metadata } from 'next';
import { AccountPaymentMethodsPanel } from '../../../components/account/account-payment-methods-panel';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'paymentMethods', '/account/payment-methods');
}

export default function AccountPaymentMethodsPage() {
  return <AccountPaymentMethodsPanel />;
}
