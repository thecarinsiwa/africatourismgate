'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

const links = [
  { href: '/systeme/roles', label: 'Rôles' },
  { href: '/systeme/roles/permissions', label: 'Permissions' },
  { href: '/systeme/roles/assignations', label: 'Assignations' },
  { href: '/systeme/audit', label: 'Audit' },
];

type RbacSubnavProps = {
  onNavigate?: (href: string, proceed: () => void) => void;
};

export function RbacSubnav({ onNavigate }: RbacSubnavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useCallback(
    (href: string) => {
      if (href === '/systeme/roles') {
        return (
          pathname === '/systeme/roles' ||
          pathname.startsWith('/systeme/roles/nouveau') ||
          /^\/systeme\/roles\/[0-9a-f-]{36}$/i.test(pathname)
        );
      }
      if (href === '/systeme/audit') {
        return pathname === '/systeme/audit' || pathname.startsWith('/systeme/audit/');
      }
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  const handleNavigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!onNavigate || isActive(href)) return;
      event.preventDefault();
      onNavigate(href, () => router.push(href));
    },
    [onNavigate, isActive, router],
  );

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-atg-border pb-4">
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(event) => handleNavigate(event, link.href)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-white'
                : 'text-atg-muted hover:bg-atg-elevated hover:text-atg-fg'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
