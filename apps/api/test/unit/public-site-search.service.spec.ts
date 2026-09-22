import { PublicSiteSearchService } from '../../src/modules/public/site-search/public-site-search.service';
import type { PublicSiteSearchHit } from '@africatourismgate/types';

function hit(
  type: PublicSiteSearchHit['type'],
  id: string,
): PublicSiteSearchHit {
  return {
    type,
    id,
    title: `${type}-${id}`,
    subtitle: null,
    href: `/${type}/${id}`,
    imageUrl: null,
    score: 50,
  };
}

describe('PublicSiteSearchService', () => {
  it('aggregates catalogue groups and keeps empty types', async () => {
    const accommodations = {
      searchCatalog: jest.fn().mockResolvedValue([hit('hotels', 'h1')]),
    };
    const activities = {
      searchCatalog: jest.fn().mockResolvedValue([]),
    };
    const packages = {
      searchCatalog: jest.fn().mockResolvedValue([hit('packages', 'p1')]),
    };
    const blog = {
      searchCatalog: jest.fn().mockResolvedValue([hit('blog', 'slug')]),
    };
    const flights = {
      searchCatalog: jest.fn().mockResolvedValue([]),
    };
    const vehicles = {
      searchCatalog: jest.fn().mockResolvedValue([]),
    };
    const cruises = {
      searchCatalog: jest.fn().mockResolvedValue([]),
    };

    const service = new PublicSiteSearchService(
      accommodations as never,
      activities as never,
      packages as never,
      blog as never,
      flights as never,
      vehicles as never,
      cruises as never,
    );

    const response = await service.search({
      q: '  Kinshasa  ',
      locale: 'fr',
      limit: 5,
      types: ['hotels', 'packages', 'blog'],
    });

    expect(response.query).toBe('Kinshasa');
    expect(response.locale).toBe('fr');
    expect(response.types).toEqual(['hotels', 'packages', 'blog']);
    expect(response.groups).toHaveLength(3);
    expect(response.groups[0]).toMatchObject({
      type: 'hotels',
      hits: [expect.objectContaining({ id: 'h1' })],
      error: null,
    });
    expect(response.groups[1].hits[0]?.id).toBe('p1');
    expect(response.groups[2].hits[0]?.id).toBe('slug');
    expect(blog.searchCatalog).toHaveBeenCalledWith('Kinshasa', 5, 'fr');
  });

  it('isolates per-type failures', async () => {
    const accommodations = {
      searchCatalog: jest.fn().mockRejectedValue(new Error('hotels down')),
    };
    const activities = {
      searchCatalog: jest.fn().mockResolvedValue([hit('activities', 'a1')]),
    };

    const service = new PublicSiteSearchService(
      accommodations as never,
      activities as never,
      { searchCatalog: jest.fn().mockResolvedValue([]) } as never,
      { searchCatalog: jest.fn().mockResolvedValue([]) } as never,
      { searchCatalog: jest.fn().mockResolvedValue([]) } as never,
      { searchCatalog: jest.fn().mockResolvedValue([]) } as never,
      { searchCatalog: jest.fn().mockResolvedValue([]) } as never,
    );

    const response = await service.search({
      q: 'safari',
      types: ['hotels', 'activities'],
    });

    expect(response.groups[0]).toMatchObject({
      type: 'hotels',
      hits: [],
      error: 'hotels down',
    });
    expect(response.groups[1].hits).toHaveLength(1);
  });
});
