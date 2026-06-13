import { cn } from '../lib/cn';
import { TextLink } from './text-link';

export type BreadcrumbItem = {
  /** Texte affiché pour ce segment. */
  label: string;
  /** Lien de navigation ; omis pour le segment courant (dernier). */
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-atg-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden className="select-none text-atg-muted/70">
                  ›
                </span>
              ) : null}
              {item.href && !isLast ? (
                <TextLink href={item.href} variant="muted" className="hover:text-primary">
                  {item.label}
                </TextLink>
              ) : (
                <span
                  className={cn(isLast ? 'font-medium text-atg-fg' : 'text-atg-muted')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
