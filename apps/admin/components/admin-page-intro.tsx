import { cn, TextLink } from '@africatourismgate/ui';
import type { ReactNode } from 'react';

export type AdminIntroLink = {
  href: string;
  label: string;
};

type AdminPageIntroProps = {
  /** Texte descriptif simple (sans markup). */
  description?: string;
  /** Liens secondaires séparés par · sous la description. */
  links?: AdminIntroLink[];
  className?: string;
  /** Contenu riche (liens inline, code, etc.). */
  children?: ReactNode;
};

export function AdminPageIntro({
  description,
  links,
  className,
  children,
}: AdminPageIntroProps) {
  if (!description && !links?.length && !children) return null;

  if (children) {
    return (
      <div className={cn('mb-8 space-y-3 text-sm text-atg-muted', className)}>{children}</div>
    );
  }

  return (
    <div className={cn('mb-8 space-y-3 text-sm text-atg-muted', className)}>
      {description ? <p>{description}</p> : null}
      {links?.length ? (
        <p>
          {links.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? <span className="mx-2 text-atg-muted">·</span> : null}
              <TextLink href={link.href} variant="primary" className="font-medium">
                {link.label}
              </TextLink>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
