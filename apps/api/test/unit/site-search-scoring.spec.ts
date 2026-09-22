import {
  ACTIVITY_SITE_SEARCH_WEIGHTS,
  BLOG_SITE_SEARCH_WEIGHTS,
  CRUISE_SITE_SEARCH_WEIGHTS,
  FLIGHT_SITE_SEARCH_WEIGHTS,
  HOTEL_SITE_SEARCH_WEIGHTS,
  PACKAGE_SITE_SEARCH_WEIGHTS,
  VEHICLE_SITE_SEARCH_WEIGHTS,
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

  it('scores flight number over airline and airport', () => {
    const flightNumber = scoreSiteSearchTextMatch('kq550', [
      { weight: FLIGHT_SITE_SEARCH_WEIGHTS.flightNumber, value: 'KQ550' },
      { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airline, value: 'Kenya Airways' },
      { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: 'Nairobi' },
    ]);
    const airportOnly = scoreSiteSearchTextMatch('nairobi', [
      { weight: FLIGHT_SITE_SEARCH_WEIGHTS.flightNumber, value: 'ET302' },
      { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airline, value: 'Ethiopian' },
      { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: 'Nairobi' },
    ]);

    expect(flightNumber).toBe(FLIGHT_SITE_SEARCH_WEIGHTS.flightNumber);
    expect(airportOnly).toBe(FLIGHT_SITE_SEARCH_WEIGHTS.airport);
    expect(flightNumber).toBeGreaterThan(airportOnly);
  });

  it('scores vehicle model over category and destination', () => {
    const model = scoreSiteSearchTextMatch('yaris', [
      { weight: VEHICLE_SITE_SEARCH_WEIGHTS.model, value: 'Toyota Yaris' },
      { weight: VEHICLE_SITE_SEARCH_WEIGHTS.category, value: 'Economy' },
      { weight: VEHICLE_SITE_SEARCH_WEIGHTS.destination, value: 'Kinshasa' },
    ]);
    const destinationOnly = scoreSiteSearchTextMatch('kinshasa', [
      { weight: VEHICLE_SITE_SEARCH_WEIGHTS.model, value: 'SUV X' },
      { weight: VEHICLE_SITE_SEARCH_WEIGHTS.category, value: 'SUV' },
      { weight: VEHICLE_SITE_SEARCH_WEIGHTS.destination, value: 'Kinshasa' },
    ]);

    expect(model).toBe(VEHICLE_SITE_SEARCH_WEIGHTS.model - 15);
    expect(destinationOnly).toBe(VEHICLE_SITE_SEARCH_WEIGHTS.destination);
    expect(model).toBeGreaterThan(destinationOnly);
  });

  it('scores cruise itinerary over ship, line and port', () => {
    const itinerary = scoreSiteSearchTextMatch('kinshasa', [
      {
        weight: CRUISE_SITE_SEARCH_WEIGHTS.itinerary,
        value: 'Kinshasa — Banana',
      },
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.ship, value: 'Congo River Spirit' },
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.line, value: 'Africa River Cruises' },
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.port, value: 'Banana Port' },
    ]);
    const portOnly = scoreSiteSearchTextMatch('banana', [
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.itinerary, value: 'River Loop' },
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.ship, value: 'Spirit' },
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.line, value: 'ARC' },
      { weight: CRUISE_SITE_SEARCH_WEIGHTS.port, value: 'Banana Port' },
    ]);

    expect(itinerary).toBe(CRUISE_SITE_SEARCH_WEIGHTS.itinerary - 5);
    expect(portOnly).toBe(CRUISE_SITE_SEARCH_WEIGHTS.port - 5);
    expect(itinerary).toBeGreaterThan(portOnly);
  });

  it('returns 0 when nothing matches', () => {
    expect(
      scoreSiteSearchTextMatch('xyz', [
        { weight: HOTEL_SITE_SEARCH_WEIGHTS.name, value: 'Savanna Lodge' },
      ]),
    ).toBe(0);
  });
});
