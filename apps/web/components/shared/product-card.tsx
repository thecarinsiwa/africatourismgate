import type { ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';

/** Carte produit listing — coque visuelle à slots (image, titre, meta, corps, prix, actions). */
export type ProductCardProps = {
  /** Zone image (fond, gradient, aria-label). */
  image: ReactNode;
  /** Badge superposé sur l'image (ex. type de propriété). */
  imageBadge?: ReactNode;
  /** Titre principal (souvent un h3). */
  title: ReactNode;
  /** Ligne secondaire sous le titre (localisation, horaire…). */
  meta?: ReactNode;
  /** Contenu central (étoiles, équipements, badges). */
  body?: ReactNode;
  /** Bloc prix dans le pied de carte. */
  price: ReactNode;
  /** Boutons ou liens d'action dans le pied de carte. */
  actions: ReactNode;
  className?: string;
};

export function ProductCard({
  image,
  imageBadge,
  title,
  meta,
  body,
  price,
  actions,
  className,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated sm:flex-row',
        className,
      )}
    >
      <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-72 lg:w-80">
        {image}
        {imageBadge}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title}
            {meta ? <div className="mt-1">{meta}</div> : null}
          </div>
        </div>

        {body}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-atg-border pt-4 dark:border-atg-border">
          {price}
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
      </div>
    </article>
  );
}
