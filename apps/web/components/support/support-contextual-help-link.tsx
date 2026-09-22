'use client';

import { cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  getWebContextualHelpHref,
  resolveWebContextualHelp,
} from '../../lib/support/contextual-help';

export type SupportContextualHelpLinkProps = {
  className?: string;
};

export function SupportContextualHelpLink({
  className,
}: SupportContextualHelpLinkProps) {
  const pathname = usePathname();
  const t = useTranslations('support');

  const { href, label, isContextual } = useMemo(() => {
    const target = resolveWebContextualHelp(pathname);
    const contextual = target !== null;
    return {
      href: getWebContextualHelpHref(pathname),
      label: contextual ? t('openContextualHelp') : t('contextualHelp'),
      isContextual: contextual,
    };
  }, [pathname, t]);

  return (
    <Link
      href={href}
      data-testid="support-contextual-help-link"
      data-contextual={isContextual ? 'true' : 'false'}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-primary outline-none transition-colors',
        'hover:underline focus-visible:underline',
        className,
      )}
    >
      {label}
    </Link>
  );
}
