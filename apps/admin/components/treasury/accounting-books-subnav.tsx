'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const linkKeys = [
  { href: '/tresorerie/comptabilite', labelKey: 'links' as const, exact: true },
  { href: '/tresorerie/comptabilite/journal', labelKey: 'journal' as const },
  {
    href: '/tresorerie/comptabilite/grand-livre',
    labelKey: 'generalLedger' as const,
  },
  { href: '/tresorerie/comptabilite/balance', labelKey: 'balance' as const },
];

export function AccountingBooksSubnav() {
  const pathname = usePathname();
  const t = useTranslations('modules.treasury.accounting.booksSubnav');

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-atg-border pb-4"
      aria-label={t('ariaLabel')}
    >
      {linkKeys.map((link) => {
        const active = link.exact
          ? pathname === link.href
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
