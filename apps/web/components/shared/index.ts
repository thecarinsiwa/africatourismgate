/**
 * Composants fondation web réutilisables (WEB-UX-1).
 *
 * Composants locaux : cartes produit, hero marketing, prix, étoiles.
 * Composants partagés admin + web : importer depuis `@africatourismgate/ui` :
 * - `EmptyState` — titre, description, icône et action fournis par le parent
 * - `FilterBar` — passer `clearLabel`, `applyLabel`, `toggleLabel` via next-intl
 *   (ne pas s'appuyer sur les libellés anglais par défaut)
 */

export { ProductCard, type ProductCardProps } from './product-card';
export { PriceDisplay, type PriceDisplayProps } from './price-display';
export { StarRating, type StarRatingProps } from './star-rating';
export { PageHero, type PageHeroProps } from './page-hero';
