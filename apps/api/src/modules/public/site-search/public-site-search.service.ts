import { Injectable, Logger } from '@nestjs/common';
import type {
  PublicSiteSearchGroup,
  PublicSiteSearchHit,
  PublicSiteSearchResponse,
  SiteSearchHitType,
} from '@africatourismgate/types';
import { PublicAccommodationsService } from '../accommodations/public-accommodations.service';
import { PublicActivitiesService } from '../activities/public-activities.service';
import { PublicBlogService } from '../blog/public-blog.service';
import { PublicFlightsService } from '../flights/public-flights.service';
import { PublicPackagesService } from '../packages/public-packages.service';
import {
  clampSiteSearchLimit,
  resolveSiteSearchTypes,
} from './site-search.constants';
import { SiteSearchQueryDto } from './dto/site-search-query.dto';

/**
 * Unified public catalogue search.
 * Catalogue providers are wired progressively per vertical.
 */
@Injectable()
export class PublicSiteSearchService {
  private readonly logger = new Logger(PublicSiteSearchService.name);

  constructor(
    private readonly accommodationsService: PublicAccommodationsService,
    private readonly activitiesService: PublicActivitiesService,
    private readonly packagesService: PublicPackagesService,
    private readonly blogService: PublicBlogService,
    private readonly flightsService: PublicFlightsService,
  ) {}

  async search(query: SiteSearchQueryDto): Promise<PublicSiteSearchResponse> {
    const q = query.q.trim();
    const locale = query.locale?.trim() || null;
    const limit = clampSiteSearchLimit(query.limit);
    const types = resolveSiteSearchTypes(query.types);

    const settled = await Promise.allSettled(
      types.map((type) => this.searchType(type, q, limit, locale)),
    );

    const groups: PublicSiteSearchGroup[] = settled.map((result, index) => {
      const type = types[index]!;
      if (result.status === 'fulfilled') {
        return result.value;
      }
      const message =
        result.reason instanceof Error
          ? result.reason.message
          : 'Search failed';
      this.logger.warn(`site-search type=${type} failed: ${message}`);
      return { type, hits: [], error: message };
    });

    return {
      query: q,
      locale,
      limit,
      types,
      groups,
    };
  }

  private async searchType(
    type: SiteSearchHitType,
    q: string,
    limit: number,
    locale: string | null,
  ): Promise<PublicSiteSearchGroup> {
    let hits: PublicSiteSearchHit[] = [];

    switch (type) {
      case 'hotels':
        hits = await this.accommodationsService.searchCatalog(q, limit);
        break;
      case 'activities':
        hits = await this.activitiesService.searchCatalog(q, limit);
        break;
      case 'packages':
        hits = await this.packagesService.searchCatalog(q, limit);
        break;
      case 'blog':
        hits = await this.blogService.searchCatalog(q, limit, locale);
        break;
      case 'flights':
        hits = await this.flightsService.searchCatalog(q, limit);
        break;
      default:
        hits = [];
        break;
    }

    return { type, hits, error: null };
  }
}
