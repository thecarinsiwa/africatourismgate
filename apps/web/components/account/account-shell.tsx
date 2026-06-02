'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';

const NAV = [
  { href: '/account/profile', key: 'profile' as const },
  { href: '/account/addresses', key: 'addresses' as const },
  { href: '/account/reservations', key: 'reservations' as const },
  { href: '/account/loyalty', key: 'loyalty' as const },
  { href: '/account/payment-methods', key: 'paymentMethods' as const },
] as const;

type NavKey = (typeof NAV)[number]['key'];

function resolvePageTitle(
  pathname: string,
  labels: Record<NavKey, string>,
  fallback: string,
  detailTitle: string,
): string {
  if (pathname.startsWith('/account/profile')) return labels.profile;
  if (pathname.startsWith('/account/addresses')) return labels.addresses;
  if (pathname.startsWith('/account/reservations/') && pathname !== '/account/reservations') {
    return detailTitle;
  }
  if (pathname.startsWith('/account/reservations')) return labels.reservations;
  if (pathname.startsWith('/account/loyalty')) return labels.loyalty;
  if (pathname.startsWith('/account/payment-methods')) return labels.paymentMethods;
  return fallback;
}

type Props = {
  children: ReactNode;
};

export function AccountShell({ children }: Props) {
  const pathname = usePathname();
  const t = useTranslations();
  const pageTitle = resolvePageTitle(
    pathname,
    t.account.nav,
    t.account.title,
    t.account.reservations.detail.title,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-atg-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          {t.nav.home}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-gray-900 dark:text-white">{t.account.title}</span>
        {pathname !== '/account' &&
        pathname !== '/account/profile' &&
        !pathname.match(/^\/account\/reservations\/[^/]+$/) ? (
          <>
            <span aria-hidden>/</span>
            <span className="text-gray-700 dark:text-white/80">{pageTitle}</span>
          </>
        ) : null}
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white sm:text-3xl">
          {t.account.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-atg-muted">{t.account.subtitle}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60">
          <nav
            className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-atg-border dark:bg-atg-elevated"
            aria-label={t.account.navAria}
          >
            <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
              {NAV.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href} className="min-w-0 flex-1 lg:flex-none">
                    <Link
                      href={item.href}
                      className={`flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-white/75 dark:hover:bg-white/5'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {t.account.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 border-t border-gray-100 pt-2 dark:border-atg-border">
              <Link
                href="/hotels"
                className="flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                {t.account.browseSite}
              </Link>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-atg-border dark:bg-atg-elevated">
            <h2 className="mb-5 border-b border-gray-100 pb-4 text-lg font-semibold text-[#0f1a16] dark:border-atg-border dark:text-white">
              {pageTitle}
            </h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
