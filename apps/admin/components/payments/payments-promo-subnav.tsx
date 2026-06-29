'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const linkKeys = [
  { href: '/paiements', labelKey: 'transactions' as const },
  { href: '/paiements/codes-promo', labelKey: 'promoCodes' as const },
  { href: '/paiements/promotions', labelKey: 'promotions' as const },
];

export function PaymentsPromoSubnav() {
  const pathname = usePathname();
  const t = useTranslations('modules.payments.subnav');

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 border-b border-atg-border pb-4"
      aria-label={t('ariaLabel')}
    >
      {linkKeys.map((link) => {
        const active =
          link.href === '/paiements'
            ? pathname === '/paiements'
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-white'
                : 'text-atg-muted hover:bg-atg-elevated hover:text-atg-fg'
            }`}
          >
            {t(link.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
