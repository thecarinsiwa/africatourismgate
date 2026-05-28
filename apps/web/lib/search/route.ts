export type SearchVertical = 'hotels' | 'flights' | 'cars' | 'cruises' | 'tours';

export function buildSearchRoute(vertical: SearchVertical, params: URLSearchParams): string {
  const qs = params.toString();
  if (vertical === 'hotels') {
    return qs ? `/hotels?${qs}` : '/hotels';
  }
  const base = `/search/${vertical}`;
  return qs ? `${base}?${qs}` : base;
}