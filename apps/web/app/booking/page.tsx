import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  buildReservationQuery,
  parseReservationDraft,
} from '../../lib/reservations/flow';
import { buildPrivatePageMetadata } from '../../lib/seo/metadata';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'index', '/booking');
}

/** Index `/booking`: join the real checkout when a draft is in the query, else hotels. */
export default function BookingPage({ searchParams }: PageProps) {
  const draft = parseReservationDraft(searchParams);
  if (draft) {
    redirect(`/booking/cart?${buildReservationQuery(draft)}`);
  }
  redirect('/hotels');
}
