'use client';

import { SidebarHeadsetIcon, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  getAdminContextualHelpHref,
  resolveAdminContextualHelp,
} from '../../lib/admin-help/contextual-help';

export function AdminContextualHelpLink() {
  const pathname = usePathname();
  const t = useTranslations('modules.adminHelp.ui');

  const { href, label } = useMemo(() => {
    const target = resolveAdminContextualHelp(pathname);
    return {
      href: getAdminContextualHelpHref(pathname),
      label: target ? t('openContextualHelp') : t('contextualHelp'),
    };
  }, [pathname, t]);

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      data-testid="admin-contextual-help-link"
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-atg-border bg-atg-elevated',
        'text-atg-fg transition-colors hover:bg-atg-surface',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      <SidebarHeadsetIcon className="h-5 w-5" />
    </Link>
  );
}
