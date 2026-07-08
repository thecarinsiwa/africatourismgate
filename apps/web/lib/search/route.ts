export type SearchVertical = 'hotels' | 'flights' | 'cars' | 'cruises' | 'tours';

export const SEARCH_VERTICALS: SearchVertical[] = [
  'tours',
  'hotels',
  'flights',
  'cars',
  'cruises',
];

/** Toggle per vertical; unimplemented verticals route to /coming-soon/[vertical]. */
export const IMPLEMENTED_SEARCH_VERTICALS: Record<SearchVertical, boolean> = {
  hotels: true,
  flights: true,
  cars: true,
  cruises: true,
  tours: true,
};

export function isSearchVertical(value: string): value is SearchVertical {
  return (SEARCH_VERTICALS as string[]).includes(value);
}

export function isSearchVerticalImplemented(vertical: SearchVertical): boolean {
  return IMPLEMENTED_SEARCH_VERTICALS[vertical];
}

export function buildComingSoonRoute(
  vertical: SearchVertical,
  params: URLSearchParams,
): string {
  const qs = params.toString();
  const base = `/coming-soon/${vertical}`;
  return qs ? `${base}?${qs}` : base;
}

function buildLiveSearchRoute(vertical: SearchVertical, params: URLSearchParams): string {
  const qs = params.toString();
  if (vertical === 'hotels') {
    return qs ? `/hotels?${qs}` : '/hotels';
  }
  if (vertical === 'flights') {
    return qs ? `/flights?${qs}` : '/flights';
  }
  if (vertical === 'cars') {
    return qs ? `/cars?${qs}` : '/cars';
  }
  if (vertical === 'cruises') {
    return qs ? `/cruises?${qs}` : '/cruises';
  }
  if (vertical === 'tours') {
    return qs ? `/activities?${qs}` : '/activities';
  }
  const base = `/search/${vertical}`;
  return qs ? `${base}?${qs}` : base;
}

export function buildSearchRoute(vertical: SearchVertical, params: URLSearchParams): string {
  if (!isSearchVerticalImplemented(vertical)) {
    return buildComingSoonRoute(vertical, params);
  }
  return buildLiveSearchRoute(vertical, params);
}

/** Navbar / footer list link for a vertical (no search params). */
export function buildVerticalListRoute(vertical: SearchVertical): string {
  return buildSearchRoute(vertical, new URLSearchParams());
}
