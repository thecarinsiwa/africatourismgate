import { BookingLoginPageContent } from '../../../components/reservations/booking-login-page-content';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function BookingLoginPage({ searchParams }: PageProps) {
  const next = pickParam(searchParams.next);
  return <BookingLoginPageContent nextPath={next} />;
}
