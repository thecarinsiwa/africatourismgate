'use client';

import { BookingItemsList } from '../bookings/booking-items-list';
import { BookingItemsStatCards } from '../bookings/booking-items-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function LignesReservationPageContent() {
  return (
    <AdminIntroPage routePath="reservations/lignes">
      <BookingItemsStatCards className="mb-6" />
      <BookingItemsList />
    </AdminIntroPage>
  );
}
