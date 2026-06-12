export type SearchVertical = 'hotels' | 'flights' | 'cars' | 'cruises' | 'tours';

export function buildSearchRoute(vertical: SearchVertical, params: URLSearchParams): string {
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
  const base = `/search/${vertical}`;
  return qs ? `${base}?${qs}` : base;
}