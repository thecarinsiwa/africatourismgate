'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BrandingMark } from '../branding-mark';
import { LanguageSwitcher } from '../language-switcher';
import { AUTH_CHANGED_EVENT, hasWebSession } from '../../lib/auth/client-session';
import { useResolvedPublicContact } from '../../lib/contact/use-resolved-public-contact';
import { buildSocialLinks } from '../../lib/contact/social-links';
import { buildVerticalListRoute } from '../../lib/search/route';
import { useTranslations as useIntlTranslations } from 'next-intl';

function isPathActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  if (href.startsWith('/#') || href.startsWith('#')) return false;
  const pathOnly = href.split('?')[0].split('#')[0];
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function isNavItemActive(
  href: string,
  pathname: string,
  children: { href: string }[] = [],
): boolean {
  if (children.length > 0) {
    return children.some((child) => isPathActive(child.href, pathname));
  }
  return isPathActive(href, pathname);
}

type ThemeMode = 'light' | 'dark';

export function HomeHeader() {
  const contact = useResolvedPublicContact();
  const socialLinks = useMemo(() => buildSocialLinks(contact), [contact]);
  const t = useIntlTranslations('nav');
  const tTheme = useIntlTranslations('theme');
  const tLanguage = useIntlTranslations('language');
  const pathname = usePathname();
  const onAccountArea = pathname.startsWith('/account');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [hasSession, setHasSession] = useState(false);

  const navLinks = useMemo(
    () => [
      { href: '/', label: t('home'), children: [] as { href: string; label: string }[] },
      { href: '/#about', label: t('about'), children: [] },
      { href: '/#gallery', label: t('gallery'), children: [] },
      {
        href: '/#search',
        label: t('pages'),
        children: [
          { href: buildVerticalListRoute('hotels'), label: t('hotels') },
          { href: buildVerticalListRoute('flights'), label: t('flights') },
          { href: buildVerticalListRoute('cars'), label: t('cars') },
          { href: buildVerticalListRoute('cruises'), label: t('cruises') },
          { href: buildVerticalListRoute('tours'), label: t('tours') },
        ],
      },
      { href: '/coming-soon', label: t('blog'), children: [] },
      { href: '/packages', label: t('packages'), children: [] },
    ],
    [t],
  );

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    function syncSession() {
      setHasSession(hasWebSession());
    }

    syncSession();
    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
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
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">{contact.email}</span>
              </a>
            ) : null}
            {contact.phone ? (
              <span className="flex items-center gap-1.5 text-white/80">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 5z" />
                </svg>
                <span className="hidden sm:inline">{contact.phone}</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="topbar" />
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={s.label}
              >
                <span className="h-3.5 w-3.5">{s.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-atg-border bg-atg-elevated shadow-sm transition-colors dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 py-4">
            <BrandingMark
              showName
              nameClassName="text-lg font-bold text-atg-fg"
            />
          </Link>

          <nav className="hidden items-center gap-0 lg:flex" aria-label={t('mainAria')}>
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
                    isNavItemActive(link.href, pathname, link.children)
                      ? 'text-primary'
                      : 'text-atg-fg hover:text-primary dark:text-white/75 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {link.children.length > 0 && (
                    <svg className="h-3 w-3 ml-0.5 text-atg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {link.children.length > 0 && openDropdown === link.href && (
                  <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-atg-border bg-atg-elevated py-2 shadow-xl dark:border-atg-border dark:bg-atg-elevated">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-atg-muted transition-colors hover:bg-atg-surface hover:text-primary dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href={hasSession ? '/account' : '/booking/login?next=%2Faccount'}
              className={`inline-flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                onAccountArea && hasSession
                  ? 'bg-primary/10 text-primary'
                  : 'text-atg-fg hover:text-primary dark:text-white/75 dark:hover:text-white'
              }`}
              aria-current={onAccountArea && hasSession ? 'page' : undefined}
            >
              {hasSession ? t('myAccount') : t('signIn')}
            </Link>
            {hasSession ? (
              <Link
                href="/booking/logout"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-base font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
              >
                {t('signOut')}
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="ml-2 mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-atg-border text-atg-muted transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/75 dark:hover:border-primary dark:hover:text-white lg:ml-2 lg:mr-2"
            aria-label={theme === 'dark' ? tTheme('enableLight') : tTheme('enableDark')}
            title={theme === 'dark' ? tTheme('lightMode') : tTheme('darkMode')}
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
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-atg-muted transition-colors hover:bg-atg-surface hover:text-primary dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
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

      {menuOpen && (
        <nav
          id="mobile-nav"
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
            <li>
              <Link
                href={hasSession ? '/account' : '/booking/login?next=%2Faccount'}
                className={`flex min-h-[44px] items-center rounded-lg px-3 py-3 text-sm font-medium hover:bg-atg-surface dark:hover:bg-white/5 ${
                  onAccountArea && hasSession ? 'bg-primary/10 text-primary' : 'text-primary'
                }`}
                aria-current={onAccountArea && hasSession ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {hasSession ? t('myAccount') : t('signIn')}
              </Link>
            </li>
            {hasSession ? (
              <li>
                <Link
                  href="/booking/logout"
                  className="flex min-h-[48px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('signOut')}
                </Link>
              </li>
            ) : null}
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex min-h-[44px] items-center rounded-lg px-3 py-3 text-sm font-medium hover:bg-atg-surface hover:text-primary dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white ${
                    isNavItemActive(link.href, pathname, link.children)
                      ? 'text-primary'
                      : 'text-atg-fg'
                  }`}
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
                          className="flex min-h-[40px] items-center rounded-lg px-3 py-2 text-sm text-atg-muted hover:bg-atg-surface hover:text-primary dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
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
