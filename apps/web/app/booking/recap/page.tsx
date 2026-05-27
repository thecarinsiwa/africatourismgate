import { ReservationRecapPageContent } from '../../../components/reservations/reservation-recap-page-content';
import { parseReservationDraft } from '../../../lib/reservations/flow';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BookingRecapPage({ searchParams }: PageProps) {
  const draft = parseReservationDraft(searchParams);
  return <ReservationRecapPageContent draft={draft} />;
}
