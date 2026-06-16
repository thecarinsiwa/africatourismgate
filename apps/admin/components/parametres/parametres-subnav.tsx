'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export const PARAMETRES_LINKS = [
  { href: '/parametres', label: 'Paramètres' },
  { href: '/parametres/emails', label: 'E-mails' },
  { href: '/parametres/comptes', label: 'Comptes bancaires' },
] as const;

export function isParametresLinkActive(pathname: string, href: string): boolean {
  if (href === '/parametres') {
    return pathname === '/parametres';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClassName(active: boolean, orientation: 'horizontal' | 'vertical'): string {
  const base =
    'shrink-0 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface';

  if (orientation === 'horizontal') {
    return `${base} px-4 py-2 ${
      active
        ? 'bg-primary text-white'
        : 'text-atg-muted hover:bg-atg-elevated hover:text-atg-fg'
    }`;
  }

  return `${base} border-l-2 px-3 py-2.5 ${
    active
      ? 'border-primary bg-atg-elevated font-semibold text-atg-fg'
      : 'border-transparent text-atg-muted hover:border-atg-border hover:bg-atg-elevated hover:text-atg-fg'
  }`;
}

export function ParametresSubnav() {
  const pathname = usePathname();

  return (
    <aside className="mb-6 lg:sticky lg:top-6 lg:mb-0 lg:self-start">
      {/* Mobile: horizontal scrollable tabs */}
      <nav
        className="flex gap-2 overflow-x-auto border-b border-atg-border pb-4 lg:hidden"
        aria-label="Navigation paramètres"
      >
        {PARAMETRES_LINKS.map((link) => {
          const active = isParametresLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={linkClassName(active, 'horizontal')}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sticky tabs */}
      <nav
        className="hidden flex-col gap-1 border-r border-atg-border pr-4 lg:flex"
        aria-label="Navigation paramètres"
      >
        {PARAMETRES_LINKS.map((link) => {
          const active = isParametresLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={linkClassName(active, 'vertical')}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

type ParametresPageLayoutProps = {
  children: ReactNode;
};

export function ParametresPageLayout({ children }: ParametresPageLayoutProps) {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      <ParametresSubnav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
