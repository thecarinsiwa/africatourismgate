'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/parametres', label: 'Paramètres' },
  { href: '/parametres/emails', label: 'E-mails' },
  { href: '/parametres/comptes', label: 'Comptes bancaires' },
];

export function ParametresSubnav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-atg-border pb-4">
      {links.map((link) => {
        const active =
          link.href === '/parametres'
            ? pathname === '/parametres'
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
