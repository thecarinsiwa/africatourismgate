import type { Metadata } from 'next';
import { BookingRegisterPageContent } from '../../../components/reservations/booking-register-page-content';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'register', '/booking/register');
}

export default function BookingRegisterPage({ searchParams }: PageProps) {
  const next = pickParam(searchParams.next);
  return <BookingRegisterPageContent nextPath={next} />;
}
