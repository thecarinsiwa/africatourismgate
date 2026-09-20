import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'requestSuccess', '/booking/request-success');
}

export default function BookingRequestSuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
