'use client';

import { cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type AdminPageBackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function AdminPageBackLink({
  href,
  label,
  className,
}: AdminPageBackLinkProps) {
  const t = useTranslations('common.actions');
  const resolvedLabel = label ?? t('back');

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex text-sm font-medium text-primary transition-colors hover:text-primary-hover',
        className,
      )}
    >
      ← {resolvedLabel}
    </Link>
  );
}
