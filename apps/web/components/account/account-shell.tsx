'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';

const NAV = [
  { href: '/account/profile', key: 'profile' as const },
  { href: '/account/addresses', key: 'addresses' as const },
  { href: '/account/reservations', key: 'reservations' as const },
  { href: '/account/payment-methods', key: 'paymentMethods' as const },
];

type Props = {
  children: ReactNode;
};

export function AccountShell({ children }: Props) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">{t.account.title}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-atg-muted">{t.account.subtitle}</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <nav
          className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-52 lg:flex-col"
          aria-label={t.account.navAria}
        >
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-white/75 dark:hover:bg-white/5'
                }`}
              >
                {t.account.nav[item.key]}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
