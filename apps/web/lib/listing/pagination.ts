'use client';

import { useEffect, useMemo, useState } from 'react';

export const LISTING_PAGE_SIZE = 10;

export type ListingPaginationState<T> = {
  pageItems: T[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  showPagination: boolean;
};

/** Découpe une liste en pages de taille fixe ; réinitialise à la page 1 quand `resetToken` change. */
export function useListingPagination<T>(
  items: T[],
  resetToken: unknown,
  pageSize: number = LISTING_PAGE_SIZE,
): ListingPaginationState<T> {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetToken]);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    pageItems,
    page: safePage,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination: totalItems > pageSize,
  };
}
