import {
  HOTEL_SITE_SEARCH_WEIGHTS,
  scoreSiteSearchTextMatch,
} from '../../src/modules/public/site-search/site-search-scoring';

describe('site-search-scoring', () => {
  it('scores exact name higher than description contains', () => {
    const exactName = scoreSiteSearchTextMatch('savanna', [
      { weight: HOTEL_SITE_SEARCH_WEIGHTS.name, value: 'Savanna' },
      {
        weight: HOTEL_SITE_SEARCH_WEIGHTS.description,
        value: 'Near savanna park',
      },
    ]);
    const descriptionOnly = scoreSiteSearchTextMatch('savanna', [
      { weight: HOTEL_SITE_SEARCH_WEIGHTS.name, value: 'City Hotel' },
      {
        weight: HOTEL_SITE_SEARCH_WEIGHTS.description,
        value: 'Near savanna park',
      },
    ]);

    expect(exactName).toBe(HOTEL_SITE_SEARCH_WEIGHTS.name);
    expect(descriptionOnly).toBe(HOTEL_SITE_SEARCH_WEIGHTS.description - 15);
    expect(exactName).toBeGreaterThan(descriptionOnly);
  });

  it('scores destination and slug matches', () => {
    const destination = scoreSiteSearchTextMatch('kinshasa', [
      { weight: HOTEL_SITE_SEARCH_WEIGHTS.destination, value: 'Kinshasa' },
    ]);
    const slugPrefix = scoreSiteSearchTextMatch('tourism-gate', [
      {
        weight: HOTEL_SITE_SEARCH_WEIGHTS.slug,
        value: 'tourism-gate-demo-hotel',
      },
    ]);
    const slugContains = scoreSiteSearchTextMatch('demo-hotel', [
      {
        weight: HOTEL_SITE_SEARCH_WEIGHTS.slug,
        value: 'tourism-gate-demo-hotel',
      },
    ]);

    expect(destination).toBe(HOTEL_SITE_SEARCH_WEIGHTS.destination);
    expect(slugPrefix).toBe(HOTEL_SITE_SEARCH_WEIGHTS.slug - 5);
    expect(slugContains).toBe(HOTEL_SITE_SEARCH_WEIGHTS.slug - 15);
  });

  it('returns 0 when nothing matches', () => {
    expect(
      scoreSiteSearchTextMatch('xyz', [
        { weight: HOTEL_SITE_SEARCH_WEIGHTS.name, value: 'Savanna Lodge' },
      ]),
    ).toBe(0);
  });
});
