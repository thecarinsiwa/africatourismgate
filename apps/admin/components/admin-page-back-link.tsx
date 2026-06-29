import { cn } from '@africatourismgate/ui';
import Link from 'next/link';

type AdminPageBackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function AdminPageBackLink({
  href,
  label = 'Retour',
  className,
}: AdminPageBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex text-sm font-medium text-primary transition-colors hover:text-primary-hover',
        className,
      )}
    >
      ← {label}
    </Link>
  );
}
