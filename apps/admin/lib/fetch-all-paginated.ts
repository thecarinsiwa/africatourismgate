import type { PaginatedResponse } from '@africatourismgate/types';

const PAGE_LIMIT = 100;

type PaginatedFetcher<T> = (page: number, limit: number) => Promise<PaginatedResponse<T>>;

/**
 * Récupère toutes les pages d'une ressource paginée.
 * Page 1 d'abord, puis pages 2…N en parallèle (pas de waterfall inter-pages).
 */
export async function fetchAllPaginated<T>(fetchPage: PaginatedFetcher<T>): Promise<T[]> {
  const first = await fetchPage(1, PAGE_LIMIT);
  const items = [...first.data];

  if (first.meta.totalPages <= 1) {
    return items;
  }

  const rest = await Promise.all(
    Array.from({ length: first.meta.totalPages - 1 }, (_, index) =>
      fetchPage(index + 2, PAGE_LIMIT),
    ),
  );

  for (const page of rest) {
    items.push(...page.data);
  }

  return items;
}
