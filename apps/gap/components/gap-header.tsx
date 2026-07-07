'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ThemeToggle } from '@africatourismgate/ui';
import { LanguageSwitcher } from './language-switcher';

const NAV_LINKS = [
  { href: '/', key: 'home' as const },
  { href: '/about', key: 'about' as const },
  { href: '/objectives', key: 'objectives' as const },
  { href: '/unesco', key: 'unesco' as const },
  { href: '/activities', key: 'activities' as const },
  { href: '/media', key: 'media' as const },
];

export function GapHeader() {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-atg-border/80 bg-atg-elevated/95 text-atg-fg backdrop-blur-md dark:bg-atg-elevated/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold uppercase tracking-wide text-primary">
            GAP
          </span>
          <span className="truncate text-xs text-atg-muted group-hover:text-atg-fg">
            Gorilla Ambassadors
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg'
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle labels={{ light: tTheme('light'), dark: tTheme('dark') }} />
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex rounded-md border border-atg-border p-2 text-atg-fg md:hidden"
            aria-expanded={open}
            aria-label={open ? t('closeMenu') : t('openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-lg leading-none">{open ? '×' : '☰'}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-atg-border bg-atg-elevated px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-atg-fg hover:bg-atg-surface"
                  onClick={() => setOpen(false)}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
