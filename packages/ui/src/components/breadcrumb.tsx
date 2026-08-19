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
  /** Accessible name for the navigation landmark (i18n). */
  ariaLabel?: string;
  className?: string;
};

type BreadcrumbListProps = {
  items: BreadcrumbItem[];
  showEllipsisAfterFirst?: boolean;
  className?: string;
};

function BreadcrumbList({ items, showEllipsisAfterFirst, className }: BreadcrumbListProps) {
  if (items.length === 0) return null;

  return (
    <ol className={cn('flex min-w-0 items-center gap-1.5 text-atg-muted', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const showSeparator = index > 0;
        const showEllipsis = showEllipsisAfterFirst && index === 1;

        return (
          <li
            key={`${item.label}-${index}`}
            className={cn(
              'inline-flex min-w-0 items-center gap-1.5',
              isLast && 'shrink min-w-0',
            )}
          >
            {showSeparator ? (
              showEllipsis ? (
                <>
                  <span aria-hidden className="select-none text-atg-muted/70">
                    ›
                  </span>
                  <span className="select-none text-atg-muted/70" aria-hidden>
                    …
                  </span>
                  <span aria-hidden className="select-none text-atg-muted/70">
                    ›
                  </span>
                </>
              ) : (
                <span aria-hidden className="select-none shrink-0 text-atg-muted/70">
                  ›
                </span>
              )
            ) : null}
            {item.href && !isLast ? (
              <TextLink
                href={item.href}
                variant="muted"
                className="max-w-[8rem] truncate hover:text-primary sm:max-w-none"
              >
                {item.label}
              </TextLink>
            ) : (
              <span
                className={cn(
                  'truncate',
                  isLast ? 'font-medium text-atg-fg' : 'text-atg-muted',
                )}
                aria-current={isLast ? 'page' : undefined}
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function Breadcrumb({ items, ariaLabel = 'Breadcrumb', className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const collapseOnMobile = items.length > 2;
  const mobileItems = collapseOnMobile
    ? [items[0], items[items.length - 1]]
    : items;

  return (
    <nav aria-label={ariaLabel} className={cn('min-w-0 text-sm', className)}>
      <BreadcrumbList
        items={items}
        className="hidden min-w-0 sm:flex sm:flex-wrap"
      />
      <BreadcrumbList
        items={mobileItems}
        showEllipsisAfterFirst={collapseOnMobile && items.length > 2}
        className="flex min-w-0 sm:hidden"
      />
    </nav>
  );
}
