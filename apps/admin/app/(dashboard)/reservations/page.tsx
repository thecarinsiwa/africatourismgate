import type { Metadata } from 'next';
import { BookingsList } from '../../../components/bookings/bookings-list';

export const metadata: Metadata = {
  title: 'Réservations — Africa Tourism Gate Admin',
};

export default function ReservationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Réservations</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Liste paginée des réservations (données API live). Filtres par statut, date, client et
          organisation. Accès requis : bookings.read.
        </p>
      </div>
      <BookingsList />
    </div>
  );
}
