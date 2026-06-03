import { ReservationCartPageContent } from '../../../components/reservations/reservation-cart-page-content';
import { parseReservationDraft } from '../../../lib/reservations/flow';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function ReservationCartPage({ searchParams }: PageProps) {
  const draft = parseReservationDraft(searchParams);
  return <ReservationCartPageContent draft={draft} />;
}
