'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { GapBrandingMark } from './gap-branding-mark';
import { LanguageSwitcher } from './language-switcher';

const NAV_LINKS = [
  { href: '/', key: 'home' as const },
  { href: '/about', key: 'about' as const },
  { href: '/objectives', key: 'objectives' as const },
  { href: '/unesco', key: 'unesco' as const },
  { href: '/activities', key: 'activities' as const },
  { href: '/media', key: 'media' as const },
];

function isPathActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean, mobile = false): string {
  const base = 'transition-colors';
  if (mobile) {
    return active
      ? `${base} bg-primary/10 text-primary`
      : `${base} text-atg-fg hover:bg-atg-surface hover:text-primary dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white`;
  }
  return active
    ? `${base} text-primary`
    : `${base} text-atg-fg hover:text-primary dark:text-white/75 dark:hover:text-white`;
}

export function GapHeader() {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const tFooter = useTranslations('footer');
  const tLanguage = useTranslations('language');
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const isDark = themeMounted && resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-atg-border bg-atg-surface text-atg-fg dark:border-white/10 dark:bg-[#1b1b2f] dark:text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <a
            href="https://africatourismgate.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-1 text-xs font-medium text-atg-muted transition-colors hover:text-primary dark:text-white/90 dark:hover:text-white sm:text-sm"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>{tFooter('mainSite')}</span>
          </a>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="topbar" />
          </div>
        </div>
      </div>

      <div className="border-b border-atg-border bg-atg-elevated shadow-sm transition-colors dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 py-4">
            <GapBrandingMark />
          </Link>

          <nav className="hidden items-center gap-0 lg:flex" aria-label={t('mainAria')}>
            {NAV_LINKS.map((link) => {
              const active = isPathActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center px-4 py-5 text-sm font-medium ${navLinkClass(active)}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="ml-2 mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-atg-border text-atg-muted transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/75 dark:hover:border-primary dark:hover:text-white lg:ml-2 lg:mr-2"
              aria-label={isDark ? tTheme('enableLight') : tTheme('enableDark')}
              title={isDark ? tTheme('lightMode') : tTheme('darkMode')}
            >
              {isDark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-atg-muted transition-colors hover:bg-atg-surface hover:text-primary dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="gap-mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">{t('menu')}</span>
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="gap-mobile-nav"
          className="border-b border-atg-border bg-atg-elevated px-4 py-4 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:hidden"
          aria-label={t('mobileAria')}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {tLanguage('label')}
            </span>
            <LanguageSwitcher variant="navbar" />
          </div>
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = isPathActive(link.href, pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex min-h-[44px] items-center rounded-lg px-3 py-3 text-sm font-medium ${navLinkClass(active, true)}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
