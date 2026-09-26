'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { PageHero } from '../shared/page-hero';
import { SupportContextualHelpLink } from '../support/support-contextual-help-link';
import {
  AccountAddressesIcon,
  AccountBrowseIcon,
  AccountHelpIcon,
  AccountLoyaltyIcon,
  AccountPaymentIcon,
  AccountProfileIcon,
  AccountReservationsIcon,
  AccountSupportTicketsIcon,
} from './account-nav-icons';

const NAV = [
  { href: '/account/profile', key: 'profile' as const, Icon: AccountProfileIcon },
  { href: '/account/addresses', key: 'addresses' as const, Icon: AccountAddressesIcon },
  { href: '/account/reservations', key: 'reservations' as const, Icon: AccountReservationsIcon },
  { href: '/account/loyalty', key: 'loyalty' as const, Icon: AccountLoyaltyIcon },
  { href: '/account/payment-methods', key: 'paymentMethods' as const, Icon: AccountPaymentIcon },
  { href: '/account/support', key: 'tickets' as const, Icon: AccountSupportTicketsIcon },
  { href: '/support', key: 'help' as const, Icon: AccountHelpIcon },
] as const;

type NavKey = (typeof NAV)[number]['key'];

function resolvePageTitle(
  pathname: string,
  labels: Record<NavKey, string>,
  fallback: string,
  reservationDetailTitle: string,
  supportDetailTitle: string,
): string {
  if (pathname.startsWith('/account/profile')) return labels.profile;
  if (pathname.startsWith('/account/addresses')) return labels.addresses;
  if (pathname.startsWith('/account/reservations/') && pathname !== '/account/reservations') {
    return reservationDetailTitle;
  }
  if (pathname.startsWith('/account/reservations')) return labels.reservations;
  if (pathname.startsWith('/account/loyalty')) return labels.loyalty;
  if (pathname.startsWith('/account/payment-methods')) return labels.paymentMethods;
  if (pathname.startsWith('/account/support/') && pathname !== '/account/support') {
    return supportDetailTitle;
  }
  if (pathname.startsWith('/account/support')) return labels.tickets;
  return fallback;
}

function isReservationDetailPage(pathname: string): boolean {
  return Boolean(pathname.match(/^\/account\/reservations\/[^/]+$/));
}

function isSupportDetailPage(pathname: string): boolean {
  return Boolean(pathname.match(/^\/account\/support\/[^/]+$/));
}

type Props = {
  children: ReactNode;
};

export function AccountShell({ children }: Props) {
  const pathname = usePathname();
  const t = useTranslations('account');
  const tNav = useTranslations('nav');
  const navLabels: Record<NavKey, string> = {
    profile: t('nav.profile'),
    addresses: t('nav.addresses'),
    reservations: t('nav.reservations'),
    loyalty: t('nav.loyalty'),
    paymentMethods: t('nav.paymentMethods'),
    tickets: t('nav.tickets'),
    help: t('nav.help'),
  };
  const pageTitle = resolvePageTitle(
    pathname,
    navLabels,
    t('title'),
    t('reservations.detail.title'),
    t('support.detailTitle'),
  );
  const onReservationsDetail = isReservationDetailPage(pathname);
  const onSupportDetail = isSupportDetailPage(pathname);
  const onNestedDetail = onReservationsDetail || onSupportDetail;

  const breadcrumb = (
    <nav
      className="flex flex-wrap items-center gap-2 text-sm text-white/60"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="transition-colors hover:text-white">
        {tNav('home')}
      </Link>
      <span aria-hidden>/</span>
      <Link
        href="/account/profile"
        className={`transition-colors hover:text-white ${
          pathname === '/account/profile' ? 'font-medium text-white' : ''
        }`}
      >
        {t('title')}
      </Link>
      {pathname !== '/account' && pathname !== '/account/profile' ? (
        <>
          <span aria-hidden>/</span>
          {onNestedDetail ? (
            <Link
              href={onSupportDetail ? '/account/support' : '/account/reservations'}
              className="transition-colors hover:text-white"
            >
              {onSupportDetail ? t('nav.tickets') : t('nav.reservations')}
            </Link>
          ) : (
            <span className="font-medium text-white">{pageTitle}</span>
          )}
        </>
      ) : null}
      {onNestedDetail ? (
        <>
          <span aria-hidden>/</span>
          <span className="font-medium text-white">{pageTitle}</span>
        </>
      ) : null}
    </nav>
  );

  return (
    <>
      <PageHero
        breadcrumb={breadcrumb}
        title={
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h1>
        }
        description={
          <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {t('subtitle')}
          </p>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64">
            <nav
              className="rounded-xl border border-atg-border bg-atg-elevated shadow-sm dark:border-atg-border dark:bg-atg-elevated"
              aria-label={t('navAria')}
            >
              <ul className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
                {NAV.map((item) => {
                  const active =
                    item.href === '/support'
                      ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.Icon;
                  return (
                    <li key={item.href} className="min-w-0 shrink-0 lg:shrink">
                      <Link
                        href={item.href}
                        className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all lg:px-4 ${
                          active
                            ? 'bg-primary text-white shadow-md ring-2 ring-primary/30 lg:border-l-4 lg:border-l-white/90 lg:pl-3'
                            : 'text-atg-fg hover:bg-atg-surface dark:text-white/80 dark:hover:bg-white/5'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon
                          className={active ? 'text-white' : 'text-primary/80'}
                        />
                        <span className="whitespace-nowrap">{t(`nav.${item.key}`)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-atg-border p-2 dark:border-atg-border">
                <Link
                  href="/hotels"
                  className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 lg:px-4"
                >
                  <AccountBrowseIcon />
                  <span>{t('browseSite')}</span>
                </Link>
              </div>
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="rounded-xl border border-atg-border bg-atg-elevated p-5 shadow-sm sm:p-6 dark:border-atg-border dark:bg-atg-elevated">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-atg-border pb-4 dark:border-atg-border">
                <h2 className="text-lg font-semibold text-atg-fg dark:text-white">
                  {pageTitle}
                </h2>
                <SupportContextualHelpLink />
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
