import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildPrivatePageMetadata } from '../../../../../lib/seo/metadata';

type LayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  return buildPrivatePageMetadata(
    'account',
    'reservationChat',
    `/account/reservations/${params.id}/chat`,
  );
}

export default function AccountReservationChatLayout({ children }: LayoutProps) {
  return children;
}
