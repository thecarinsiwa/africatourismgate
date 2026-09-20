import { redirect } from 'next/navigation';
import {
  buildReservationQuery,
  parseReservationDraft,
} from '../../lib/reservations/flow';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

/** Index `/booking`: join the real checkout when a draft is in the query, else hotels. */
export default function BookingPage({ searchParams }: PageProps) {
  const draft = parseReservationDraft(searchParams);
  if (draft) {
    redirect(`/booking/cart?${buildReservationQuery(draft)}`);
  }
  redirect('/hotels');
}
