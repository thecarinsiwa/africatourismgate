'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

type BookingCheckoutPageContentProps = {
  propertyId?: string;
  roomId?: string;
};

export function BookingCheckoutPageContent({
  propertyId,
  roomId,
}: BookingCheckoutPageContentProps) {
  const t = useTranslations('booking.checkout');
  const notAvailable = t('notAvailable');

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-8">
          <h1 className="text-3xl font-bold text-[#0f1a16] dark:text-white">{t('title')}</h1>
          <p className="mt-3 text-gray-600 dark:text-atg-muted">{t('subtitle')}</p>

          <div className="mt-6 space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="text-sm text-gray-600 dark:text-atg-muted">
              {t('propertyIdLabel')}{' '}
              <span className="font-mono">{propertyId ?? notAvailable}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-atg-muted">
              {t('roomIdLabel')}{' '}
              <span className="font-mono">{roomId ?? notAvailable}</span>
            </p>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-atg-muted">{t('pendingNote')}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:support@africatourismgate.com?subject=${encodeURIComponent(t('contactEmailSubject'))}`}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {t('contactCta')}
            </a>
            <Link
              href="/hotels"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80"
            >
              {t('backToHotels')}
            </Link>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
