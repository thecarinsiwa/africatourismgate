'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/systeme/roles', label: 'Rôles' },
  { href: '/systeme/roles/permissions', label: 'Permissions' },
  { href: '/systeme/roles/assignations', label: 'Assignations' },
  { href: '/systeme/audit', label: 'Audit' },
];

export function RbacSubnav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-atg-border pb-4">
      {links.map((link) => {
        const active =
          link.href === '/systeme/roles'
            ? pathname === '/systeme/roles' || pathname.startsWith('/systeme/roles/nouveau') || /^\/systeme\/roles\/[0-9a-f-]{36}$/i.test(pathname)
            : link.href === '/systeme/audit'
              ? pathname === '/systeme/audit' || pathname.startsWith('/systeme/audit/')
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
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
