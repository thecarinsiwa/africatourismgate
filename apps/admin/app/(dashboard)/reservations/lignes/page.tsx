import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { BookingItemsList } from '../../../../components/bookings/booking-items-list';

export const metadata: Metadata = {
  title: 'Lignes de réservation — Africa Tourism Gate Admin',
};

export default function BookingLinesPage() {
  return (
    <div>
      <AdminPageIntro description={"Tableau global des articles par réservation (données API live). Filtres par type, statut de\r\n          la réservation et identifiant booking. Accès requis : bookings.read."} />
      <BookingItemsList />
    </div>
  );
}
