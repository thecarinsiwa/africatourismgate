'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/cn';
import { Logo } from './logo';

export type SidebarNavItem = {
  href: string;
  label: string;
};

export type SidebarProps = {
  navItems: SidebarNavItem[];
  logo?: { name: string; href?: string };
  className?: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/dashboard/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ navItems, logo, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col border-b border-atg-border bg-atg-elevated md:w-60 md:border-b-0 md:border-r lg:w-64',
        className,
      )}
    >
      {logo ? (
        <div className="border-b border-atg-border px-4 py-5 md:px-5">
          <Logo name={logo.name} href={logo.href ?? '/dashboard'} />
        </div>
      ) : null}

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-x-visible md:px-3 md:py-4">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
