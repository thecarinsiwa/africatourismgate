import { Injectable } from '@nestjs/common';
import type {
  PublicSiteSearchGroup,
  PublicSiteSearchResponse,
  SiteSearchHitType,
} from '@africatourismgate/types';
import {
  clampSiteSearchLimit,
  resolveSiteSearchTypes,
} from './site-search.constants';
import { SiteSearchQueryDto } from './dto/site-search-query.dto';

/**
 * Unified public catalogue search.
 * Catalogue providers are wired in subsequent tasks; this establishes the response contract.
 */
@Injectable()
export class PublicSiteSearchService {
  async search(query: SiteSearchQueryDto): Promise<PublicSiteSearchResponse> {
    const q = query.q.trim();
    const locale = query.locale?.trim() || null;
    const limit = clampSiteSearchLimit(query.limit);
    const types = resolveSiteSearchTypes(query.types);

    const groups: PublicSiteSearchGroup[] = types.map((type) =>
      this.emptyGroup(type),
    );

    return {
      query: q,
      locale,
      limit,
      types,
      groups,
    };
  }

  private emptyGroup(type: SiteSearchHitType): PublicSiteSearchGroup {
    return {
      type,
      hits: [],
      error: null,
    };
  }
}
