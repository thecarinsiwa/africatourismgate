import { BookingCheckoutPageContent } from '../../components/reservations/booking-checkout-page-content';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pick(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function BookingPage({ searchParams }: PageProps) {
  const propertyId = pick(searchParams.propertyId);
  const roomId = pick(searchParams.roomId);

  return <BookingCheckoutPageContent propertyId={propertyId} roomId={roomId} />;
}
