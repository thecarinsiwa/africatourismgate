'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { BookingsList } from '../bookings/bookings-list';
import { BookingsStatCards } from '../bookings/bookings-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function ReservationsPageContent() {
  const t = useTranslations('pages.reservations');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="reservations"
        actions={
          <>
            <Button href="/reservations/lignes" variant="outline">
              {t('actions.lines')}
            </Button>
            <Button href="/guides" variant="outline">
              {t('actions.guides')}
            </Button>
          </>
        }
      />
      <BookingsStatCards className="mb-6" />
      <BookingsList />
    </div>
  );
}
