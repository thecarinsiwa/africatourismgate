import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { BookingsList } from '../../../components/bookings/bookings-list';

export const metadata: Metadata = {
  title: 'Réservations — Africa Tourism Gate Admin',
};

export default function ReservationsPage() {
  return (
    <div>
      <AdminPageIntro description={"Liste paginée des réservations (données API live). Filtres par statut, date, client et\r\n          organisation. Accès requis : bookings.read."} />
      <BookingsList />
    </div>
  );
}
