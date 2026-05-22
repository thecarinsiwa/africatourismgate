'use client';

import { Logo } from '@africatourismgate/ui';
import Link from 'next/link';
import { useState } from 'react';

/* ── Icon components (inline SVGs, no deps) ────────────── */
function IconBed() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  );
}
function IconPlane() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
function IconCar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8M6 11l2-4h8l2 4M5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
    </svg>
  );
}
function IconPackage() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function IconCruise() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18h18M5 14l-2-6h18l-2 6M8 10V6a4 4 0 018 0v4" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: '/hotels', label: 'Hébergements', icon: <IconBed /> },
  { href: '#vols', label: 'Vols', icon: <IconPlane /> },
  { href: '#voitures', label: 'Voitures', icon: <IconCar /> },
  { href: '#forfaits', label: 'Forfaits', icon: <IconPackage /> },
  { href: '#activites', label: 'Activités', icon: <IconActivity /> },
  { href: '#croisieres', label: 'Croisières', icon: <IconCruise /> },
] as const;

const SECONDARY_LINKS = [
  { href: '#deals', label: 'Deals' },
  { href: '#support', label: 'Support' },
  { href: '#connexion', label: 'Connexion' },
] as const;

export function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-atg-elevated/95 backdrop-blur-md shadow-sm">
      {/* ── Secondary bar ─────────────────────────────── */}
      <div className="hidden border-b border-atg-border md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-5 px-4 py-1.5 sm:px-6 lg:px-8">
          {SECONDARY_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-atg-muted hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Main nav bar ──────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Logo name="Africa Tourism Gate" href="/" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                link.href === '/hotels'
                  ? 'bg-primary/10 text-primary'
                  : 'text-atg-fg hover:bg-atg-surface hover:text-primary'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Burger — mobile */}
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

      {/* ── Mobile menu ───────────────────────────────── */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-atg-border bg-atg-elevated px-4 py-4 md:hidden"
          aria-label="Navigation mobile"
        >
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-atg-muted">
            Voyager
          </p>
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-atg-fg hover:bg-atg-surface"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-primary">{link.icon}</span>
                  {link.label}
                  {link.href !== '/hotels' && (
                    <span className="ml-auto rounded bg-atg-surface px-1.5 py-0.5 text-[10px] font-semibold text-atg-muted">
                      Bientôt
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-3 border-t border-atg-border" />

          <ul className="flex flex-col gap-0.5">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block min-h-[44px] rounded-lg px-3 py-3 text-sm text-atg-muted hover:bg-atg-surface hover:text-atg-fg"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-3 pt-2">
            <Link
              href="/hotels"
              className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Rechercher un hôtel
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
