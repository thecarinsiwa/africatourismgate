import type { Metadata } from 'next';
import { ReservationCartPageContent } from '../../../components/reservations/reservation-cart-page-content';
import { BookingAuthGuard } from '../../../components/reservations/booking-auth-guard';
import { parseReservationDraft } from '../../../lib/reservations/flow';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'cart', '/booking/cart');
}

export default function BookingCartPage({ searchParams }: PageProps) {
  const draft = parseReservationDraft(searchParams);
  const currentPathWithQuery = `/booking/cart?${new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) => {
      if (typeof value === 'string') return [[key, value] as [string, string]];
      if (Array.isArray(value)) return value.map((v) => [key, v] as [string, string]);
      return [];
    }),
  ).toString()}`;

  return (
    <BookingAuthGuard currentPathWithQuery={currentPathWithQuery}>
      <ReservationCartPageContent draft={draft} />
    </BookingAuthGuard>
  );
}
