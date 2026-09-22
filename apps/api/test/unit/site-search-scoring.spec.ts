import {
  ACTIVITY_SITE_SEARCH_WEIGHTS,
  BLOG_SITE_SEARCH_WEIGHTS,
  HOTEL_SITE_SEARCH_WEIGHTS,
  PACKAGE_SITE_SEARCH_WEIGHTS,
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

  it('scores activity title over destination and description', () => {
    const title = scoreSiteSearchTextMatch('gorilla', [
      { weight: ACTIVITY_SITE_SEARCH_WEIGHTS.title, value: 'Gorilla Trekking' },
      { weight: ACTIVITY_SITE_SEARCH_WEIGHTS.destination, value: 'Virunga' },
      {
        weight: ACTIVITY_SITE_SEARCH_WEIGHTS.description,
        value: 'See gorilla families',
      },
    ]);
    const destinationOnly = scoreSiteSearchTextMatch('virunga', [
      { weight: ACTIVITY_SITE_SEARCH_WEIGHTS.title, value: 'City Walk' },
      { weight: ACTIVITY_SITE_SEARCH_WEIGHTS.destination, value: 'Virunga' },
    ]);

    expect(title).toBe(ACTIVITY_SITE_SEARCH_WEIGHTS.title - 5);
    expect(destinationOnly).toBe(ACTIVITY_SITE_SEARCH_WEIGHTS.destination);
    expect(title).toBeGreaterThan(destinationOnly);
  });

  it('scores package name over description', () => {
    const name = scoreSiteSearchTextMatch('kinshasa', [
      { weight: PACKAGE_SITE_SEARCH_WEIGHTS.name, value: 'Kinshasa Duo' },
      {
        weight: PACKAGE_SITE_SEARCH_WEIGHTS.description,
        value: 'Week-end à Kinshasa',
      },
    ]);
    const descriptionOnly = scoreSiteSearchTextMatch('week-end', [
      { weight: PACKAGE_SITE_SEARCH_WEIGHTS.name, value: 'City Escape' },
      {
        weight: PACKAGE_SITE_SEARCH_WEIGHTS.description,
        value: 'Week-end à Kinshasa',
      },
    ]);

    expect(name).toBe(PACKAGE_SITE_SEARCH_WEIGHTS.name - 5);
    expect(descriptionOnly).toBe(PACKAGE_SITE_SEARCH_WEIGHTS.description - 5);
    expect(name).toBeGreaterThan(descriptionOnly);
  });

  it('scores blog title over excerpt and content', () => {
    const title = scoreSiteSearchTextMatch('safari', [
      { weight: BLOG_SITE_SEARCH_WEIGHTS.title, value: 'Safari Tips' },
      { weight: BLOG_SITE_SEARCH_WEIGHTS.excerpt, value: 'Plan a safari' },
      { weight: BLOG_SITE_SEARCH_WEIGHTS.content, value: 'Best safari seasons' },
    ]);
    const contentOnly = scoreSiteSearchTextMatch('seasons', [
      { weight: BLOG_SITE_SEARCH_WEIGHTS.title, value: 'Travel Notes' },
      { weight: BLOG_SITE_SEARCH_WEIGHTS.excerpt, value: 'Short note' },
      { weight: BLOG_SITE_SEARCH_WEIGHTS.content, value: 'Best safari seasons' },
    ]);

    expect(title).toBe(BLOG_SITE_SEARCH_WEIGHTS.title - 5);
    expect(contentOnly).toBe(BLOG_SITE_SEARCH_WEIGHTS.content - 15);
    expect(title).toBeGreaterThan(contentOnly);
  });

  it('returns 0 when nothing matches', () => {
    expect(
      scoreSiteSearchTextMatch('xyz', [
        { weight: HOTEL_SITE_SEARCH_WEIGHTS.name, value: 'Savanna Lodge' },
      ]),
    ).toBe(0);
  });
});
