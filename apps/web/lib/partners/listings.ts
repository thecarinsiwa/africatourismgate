/** Public partners listing and detail routes. */

export const PARTNERS_LIST_PATH = '/partners';

export function partnerHref(id: string): string {
  return `/partners/${encodeURIComponent(id)}`;
}

export function partnersListHref(): string {
  return PARTNERS_LIST_PATH;
}
