/**
 * Composants fondation web réutilisables (WEB-UX-1).
 *
 * Composants locaux : cartes produit, hero marketing, prix, étoiles, formulaire recherche.
 * Composants partagés admin + web : importer depuis `@africatourismgate/ui` :
 * - `EmptyState` — titre, description, icône et action fournis par le parent
 * - `FilterBar` — passer `clearLabel`, `applyLabel`, `toggleLabel` via next-intl
 *   (ne pas s'appuyer sur les libellés anglais par défaut)
 */

export { ProductCard, type ProductCardProps } from './product-card';
export { ProductGallery, type ProductGalleryLabels } from './product-gallery';
export { PriceDisplay, type PriceDisplayProps } from './price-display';
export { StarRating, type StarRatingProps } from './star-rating';
export { StarRatingInput, type StarRatingInputProps } from './star-rating-input';
export { Accordion, type AccordionItem, type AccordionProps } from './accordion';
export { PageHero, type PageHeroProps } from './page-hero';
export { SearchFormShell, type SearchFormShellProps, type SearchFormTab } from './search-form-shell';
export { SearchFormPanel, type SearchFormPanelProps } from './search-form-panel';
export {
  SearchFormInput,
  SearchFormLabel,
  SearchFormDatalistInput,
  SearchFormOptionDatalistInput,
  SearchFormSelect,
  SearchFormOptionSelect,
  SearchFormActions,
  SearchFormSubmit,
  SearchViewAllLink,
  type SearchFormActionsProps,
  type SearchFormInputProps,
  type SearchFormDatalistInputProps,
  type SearchFormOptionDatalistInputProps,
  type SearchOption,
  type SearchFormOptionSelectProps,
  type SearchFormSelectProps,
  type SearchFormSubmitProps,
  type SearchViewAllLinkProps,
} from './search-form-fields';
export { searchFormFieldClass } from './search-form-fields';
export {
  ListingSortBar,
  ListingResultsGrid,
  ListingLoadingState,
  ListingErrorBanner,
  ListingEmptyState,
  ListingFiltersAside,
  ListingPageBody,
  ListingPaginationBar,
  ListingDefaultEmptyIcon,
  type ListingSortBarProps,
  type ListingSortOption,
  type ListingResultsGridProps,
  type ListingLoadingStateProps,
  type ListingErrorBannerProps,
  type ListingEmptyStateProps,
  type ListingFiltersAsideProps,
  type ListingPageBodyProps,
  type ListingPaginationBarProps,
} from './listing-patterns';
export {
  ProductCardSkeleton,
  ListingCardsSkeleton,
  DetailPageSkeleton,
  DetailPageSkeletonShell,
  type ListingCardsSkeletonProps,
  type DetailPageSkeletonProps,
  type DetailPageSkeletonShellProps,
} from './loading-skeletons';
export {
  bookingSidebarInputClass,
  bookingSidebarDateGridClass,
  BookingSidebarDesktop,
  BookingSidebarBody,
  BookingSidebarField,
  BookingSidebarDateCard,
  BookingSidebarPriceBlock,
  BookingSidebarHint,
  BookingSidebarSummary,
  BookingSidebarCta,
  BookingSidebarTrustHints,
  BookingSidebarMobileBar,
  useBookingSidebarTrustHints,
} from './booking-sidebar-shell';
