'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LanguageSwitcher } from '../language-switcher';
import { useTranslations } from '../../lib/i18n/locale-provider';

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/africatourismgate/',
    label: 'Facebook',
    icon: (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
      </svg>
    ),
  },
  {
    href: 'https://x.com/Congotourismga1',
    label: 'X / Twitter',
    icon: (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16.01 6.01 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79L20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/africatourismgate/',
    label: 'Instagram',
    icon: (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.16C15.2 2.16 15.58 2.17 16.86 2.23C18.04 2.28 18.84 2.51 19.53 2.78C20.25 3.06 20.86 3.44 21.46 4.04C22.06 4.64 22.44 5.25 22.72 5.97C22.99 6.66 23.22 7.46 23.27 8.64C23.33 9.92 23.34 10.3 23.34 13.5C23.34 16.7 23.33 17.08 23.27 18.36C23.22 19.54 22.99 20.34 22.72 21.03C22.44 21.75 22.06 22.36 21.46 22.96C20.86 23.56 20.25 23.94 19.53 24.22C18.84 24.49 18.04 24.72 16.86 24.77C15.58 24.83 15.2 24.84 12 24.84C8.8 24.84 8.42 24.83 7.14 24.77C5.96 24.72 5.16 24.49 4.47 24.22C3.75 23.94 3.14 23.56 2.54 22.96C1.94 22.36 1.56 21.75 1.28 21.03C1.01 20.34 .78 19.54 .73 18.36C.67 17.08 .66 16.7 .66 13.5C.66 10.3 .67 9.92 .73 8.64C.78 7.46 1.01 6.66 1.28 5.97C1.56 5.25 1.94 4.64 2.54 4.04C3.14 3.44 3.75 3.06 4.47 2.78C5.16 2.51 5.96 2.28 7.14 2.23C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07C5.77.13 4.9.33 4.14.63C3.35.94 2.68 1.34 2.01 2.01C1.34 2.68.94 3.35.63 4.14C.33 4.9.13 5.77.07 7.05C.01 8.33 0 8.74 0 12C0 15.26.01 15.67.07 16.95C.13 18.23.33 19.1.63 19.86C.94 20.65 1.34 21.32 2.01 21.99C2.68 22.66 3.35 23.06 4.14 23.37C4.9 23.67 5.77 23.87 7.05 23.93C8.33 23.99 8.74 24 12 24C15.26 24 15.67 23.99 16.95 23.93C18.23 23.87 19.1 23.67 19.86 23.37C20.65 23.06 21.32 22.66 21.99 21.99C22.66 21.32 23.06 20.65 23.37 19.86C23.67 19.1 23.87 18.23 23.93 16.95C23.99 15.67 24 15.26 24 12C24 8.74 23.99 8.33 23.93 7.05C23.87 5.77 23.67 4.9 23.37 4.14C23.06 3.35 22.66 2.68 21.99 2.01C21.32 1.34 20.65.94 19.86.63C19.1.33 18.23.13 16.95.07C15.67.01 15.26 0 12 0ZM12 5.84C8.6 5.84 5.84 8.6 5.84 12C5.84 15.4 8.6 18.16 12 18.16C15.4 18.16 18.16 15.4 18.16 12C18.16 8.6 15.4 5.84 12 5.84ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM18.41 4.15C17.62 4.15 16.97 4.79 16.97 5.59C16.97 6.38 17.62 7.03 18.41 7.03C19.2 7.03 19.84 6.38 19.84 5.59C19.84 4.79 19.2 4.15 18.41 4.15Z" />
      </svg>
    ),
  },
];

type ThemeMode = 'light' | 'dark';
type PublicBranding = {
  displayName?: string;
  logoUrl?: string | null;
};

export function HomeHeader() {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [branding, setBranding] = useState<Required<PublicBranding>>({
    displayName: 'Africa Tourism Gate',
    logoUrl: null,
  });

  const navLinks = useMemo(
    () => [
      { href: '/', label: t.nav.home, children: [] as { href: string; label: string }[] },
      { href: '#about', label: t.nav.about, children: [] },
      { href: '#gallery', label: t.nav.gallery, children: [] },
      {
        href: '#pages',
        label: t.nav.pages,
        children: [
          { href: '/hotels', label: t.nav.hotels },
          { href: '#vols', label: t.nav.flights },
          { href: '#voitures', label: t.nav.cars },
          { href: '#croisieres', label: t.nav.cruises },
          { href: '#tours', label: t.nav.tours },
        ],
      },
      { href: '#blog', label: t.nav.blog, children: [] },
      { href: '#contact', label: t.nav.contact, children: [] },
    ],
    [t],
  );

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const defaultApiUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://app-africatourismgate.org/api'
        : 'http://localhost:3000/api';
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

    async function loadBranding() {
      try {
        const response = await fetch(`${apiUrl}/organization-settings/public/branding`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) return;
        const payload = (await response.json()) as PublicBranding;
        setBranding({
          displayName: payload.displayName?.trim() || 'Africa Tourism Gate',
          logoUrl: payload.logoUrl?.trim() || null,
        });
      } catch {
        // Keep defaults if branding endpoint is unavailable.
      }
    }

    void loadBranding();
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('atg-theme', nextTheme);
    setTheme(nextTheme);
  }

  return (
    <header className="w-full z-50">
      <div className="bg-[#1b1b2f] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <a
              href="mailto:support@africatourismgate.com"
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">support@africatourismgate.com</span>
            </a>
            <span className="flex items-center gap-1.5 text-white/80">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 5z" />
              </svg>
              <span className="hidden sm:inline">+243 815 000 000</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="topbar" />
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white shadow-sm transition-colors dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 py-4">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.displayName}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div>
              <span className="text-lg font-bold text-[#0f1a16] dark:text-white">
                {branding.displayName}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0 lg:flex" aria-label={t.nav.mainAria}>
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => (link.children.length > 0 ? setOpenDropdown(link.href) : undefined)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1 px-4 py-5 text-sm font-medium transition-colors ${
                    link.href === '/'
                      ? 'text-primary'
                      : 'text-[#333] hover:text-primary dark:text-white/75 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {link.children.length > 0 && (
                    <svg className="h-3 w-3 ml-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {link.children.length > 0 && openDropdown === link.href && (
                  <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-gray-100 bg-white py-2 shadow-xl dark:border-atg-border dark:bg-atg-elevated">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="ml-auto mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/75 dark:hover:border-primary dark:hover:text-white lg:ml-4"
            aria-label={theme === 'dark' ? t.theme.enableLight : t.theme.enableDark}
            title={theme === 'dark' ? t.theme.lightMode : t.theme.darkMode}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{t.nav.menu}</span>
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

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-b border-gray-100 bg-white px-4 py-4 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:hidden"
          aria-label={t.nav.mobileAria}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">
              {t.language.label}
            </span>
            <LanguageSwitcher variant="navbar" />
          </div>
          <ul className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-[44px] items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children.length > 0 && (
                  <ul className="ml-4">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="flex min-h-[40px] items-center rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-primary dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
