import type { Metadata } from 'next';
import { BookingItemsList } from '../../../../components/bookings/booking-items-list';

export const metadata: Metadata = {
  title: 'Lignes de réservation — Africa Tourism Gate Admin',
};

export default function BookingLinesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Lignes de réservation</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Tableau global des articles par réservation (données API live). Filtres par type, statut de
          la réservation et identifiant booking. Accès requis : bookings.read.
        </p>
      </div>
      <BookingItemsList />
    </div>
  );
}
