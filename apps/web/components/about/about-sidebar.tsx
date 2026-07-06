'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { ABOUT_NAV_ITEMS, normalizeAboutPathname } from '../../lib/about/routes';
import { cn } from '@africatourismgate/ui';

export function AboutSidebar() {
  const pathname = normalizeAboutPathname(usePathname());
  const t = useTranslations();
  const a = t.about;

  return (
    <>
      <nav
        className="hidden shrink-0 lg:block lg:w-56 xl:w-64"
        aria-label={a.sidebarAria}
      >
        <ul className="sticky top-24 space-y-1">
          {ABOUT_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-atg-muted hover:bg-atg-elevated hover:text-atg-fg',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {a.nav[item.labelKey]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden"
        aria-label={a.sidebarAria}
      >
        {ABOUT_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'border border-atg-border bg-atg-elevated text-atg-muted',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {a.nav[item.labelKey]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
