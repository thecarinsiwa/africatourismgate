import type { ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';

/** En-tête marketing de page liste/détail — breadcrumb, titre, description et actions en slots. */
export type PageHeroProps = {
  /** Fil d'Ariane ou navigation contextuelle (contenu fourni par le parent). */
  breadcrumb?: ReactNode;
  /** Titre principal (h1). */
  title: ReactNode;
  /** Sous-titre ou description. */
  description?: ReactNode;
  /** Zone CTA sous la description. */
  actions?: ReactNode;
  /** URL d'image de fond optionnelle. */
  backgroundImage?: string;
  className?: string;
};

export function PageHero({
  breadcrumb,
  title,
  description,
  actions,
  backgroundImage,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-[#1b1b2f] text-white',
        className,
      )}
    >
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url("${backgroundImage}")` }}
          aria-hidden
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {breadcrumb ? <div className="mb-6">{breadcrumb}</div> : null}
        {title}
        {description ? <div className="mt-4">{description}</div> : null}
        {actions ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
