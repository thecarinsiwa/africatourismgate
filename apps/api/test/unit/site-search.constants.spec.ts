import {
  clampSiteSearchLimit,
  isSiteSearchHitType,
  parseSiteSearchTypesQuery,
  resolveSiteSearchTypes,
  SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE,
  SITE_SEARCH_HIT_TYPES,
  SITE_SEARCH_MAX_LIMIT_PER_TYPE,
} from '../../src/modules/public/site-search/site-search.constants';

describe('site-search.constants', () => {
  it('recognizes catalogue hit types', () => {
    expect(isSiteSearchHitType('hotels')).toBe(true);
    expect(isSiteSearchHitType('blog')).toBe(true);
    expect(isSiteSearchHitType('pages')).toBe(false);
  });

  it('parses comma-separated and repeated types', () => {
    expect(parseSiteSearchTypesQuery('hotels,blog')).toEqual([
      'hotels',
      'blog',
    ]);
    expect(parseSiteSearchTypesQuery(['flights', 'cars,cruises'])).toEqual([
      'flights',
      'cars',
      'cruises',
    ]);
    expect(parseSiteSearchTypesQuery('hotels,unknown,hotels')).toEqual([
      'hotels',
    ]);
    expect(parseSiteSearchTypesQuery('')).toBeUndefined();
    expect(parseSiteSearchTypesQuery('nope')).toBeUndefined();
  });

  it('resolves types to full catalogue when omitted', () => {
    expect(resolveSiteSearchTypes()).toEqual([...SITE_SEARCH_HIT_TYPES]);
    expect(resolveSiteSearchTypes([])).toEqual([...SITE_SEARCH_HIT_TYPES]);
    expect(resolveSiteSearchTypes(['blog', 'hotels', 'blog'])).toEqual([
      'blog',
      'hotels',
    ]);
  });

  it('clamps limit per type', () => {
    expect(clampSiteSearchLimit()).toBe(SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE);
    expect(clampSiteSearchLimit(0)).toBe(1);
    expect(clampSiteSearchLimit(3)).toBe(3);
    expect(clampSiteSearchLimit(999)).toBe(SITE_SEARCH_MAX_LIMIT_PER_TYPE);
  });
});
