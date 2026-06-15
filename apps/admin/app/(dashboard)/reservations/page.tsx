import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { BookingsList } from '../../../components/bookings/bookings-list';
import { BookingsStatCards } from '../../../components/bookings/bookings-stat-cards';

export const metadata: Metadata = {
  title: 'Réservations — Africa Tourism Gate Admin',
};

export default function ReservationsPage() {
  return (
    <div>
      <AdminPageIntro description="Liste paginée des réservations (données API live). Filtres par statut, date, client et organisation. Accès requis : bookings.read." />
      <BookingsStatCards className="mb-6" />
      <BookingsList />
    </div>
  );
}
