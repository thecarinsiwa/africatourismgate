import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildPrivatePageMetadata } from '../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'home', '/account');
}

export default function AccountPage() {
  redirect('/account/profile');
}
