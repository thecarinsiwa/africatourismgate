'use client';

import { Logo } from '@africatourismgate/ui';
import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/hotels', label: 'Hébergements' },
  { href: '#vols', label: 'Vols' },
  { href: '#voitures', label: 'Voitures' },
  { href: '#croisieres', label: 'Croisières' },
  { href: '#activites', label: 'Activités' },
] as const;

export function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-atg-border bg-atg-elevated/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo name="Africa Tourism Gate" href="/" />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-atg-fg hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/coming-soon"
            className="text-sm text-atg-muted hover:text-primary transition-colors"
          >
            Coming Soon
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/hotels"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Rechercher un hôtel
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-atg-border md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          {menuOpen ? (
            <svg className="h-6 w-6 text-atg-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-atg-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-atg-border bg-atg-elevated px-4 py-4 md:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block min-h-[44px] rounded-lg px-3 py-3 text-sm font-medium text-atg-fg hover:bg-atg-surface"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/coming-soon"
                className="block min-h-[44px] rounded-lg px-3 py-3 text-sm text-atg-muted hover:bg-atg-surface"
                onClick={() => setMenuOpen(false)}
              >
                Coming Soon
              </Link>
            </li>
            <li className="pt-2">
              <Link
                href="/hotels"
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setMenuOpen(false)}
              >
                Rechercher un hôtel
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
