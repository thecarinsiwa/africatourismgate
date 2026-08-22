'use client';

import { useTranslations } from 'next-intl';
import { BookingItemsList } from '../bookings/booking-items-list';
import { BookingItemsStatCards } from '../bookings/booking-items-stat-cards';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from './admin-list-page-header';

export function LignesReservationPageContent() {
  const t = useTranslations('pages.reservations.lignes');
  useSetAdminPageMeta({ title: t('title') });

  return (
    <div className="min-w-0">
      <div className="mb-4">
        <AdminPageBackLink href="/reservations" label={t('backLabel')} />
      </div>
      <AdminListPageHeader routePath="reservations/lignes" />
      <BookingItemsStatCards className="mb-6" />
      <BookingItemsList />
    </div>
  );
}
