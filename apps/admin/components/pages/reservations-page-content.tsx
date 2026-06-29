'use client';

import { BookingsList } from '../bookings/bookings-list';
import { BookingsStatCards } from '../bookings/bookings-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ReservationsPageContent() {
  return (
    <AdminIntroPage routePath="reservations">
      <BookingsStatCards className="mb-6" />
      <BookingsList />
    </AdminIntroPage>
  );
}
