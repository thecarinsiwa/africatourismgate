import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'success', '/booking/success');
}

export default function BookingSuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
