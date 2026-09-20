import type { Metadata } from 'next';
import { AccountProfileForm } from '../../../components/account/account-profile-form';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'profile', '/account/profile');
}

export default function AccountProfilePage() {
  return <AccountProfileForm />;
}
