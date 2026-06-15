import { cn } from '../lib/cn';

export type PageHeaderProps = {
  /** Titre principal de la page (h1). */
  title: string;
  /** Description courte sous le titre. */
  description?: string;
  /** Actions principales (CTA) alignées à droite sur desktop. */
  actions?: React.ReactNode;
  /** Fil d'Ariane ou slot personnalisé au-dessus du titre. */
  breadcrumb?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-8 space-y-4', className)}>
      {breadcrumb ? <div>{breadcrumb}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-atg-fg">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-atg-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
