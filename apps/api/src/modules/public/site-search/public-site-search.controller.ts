import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { SiteSearchQueryDto } from './dto/site-search-query.dto';
import { SiteSearchResponseDto } from './dto/site-search-response.dto';
import { PublicSiteSearchService } from './public-site-search.service';

@ApiTags('public')
@Controller('public')
export class PublicSiteSearchController {
  constructor(private readonly service: PublicSiteSearchService) {}

  @Public()
  @Get('site-search')
  @ApiOperation({
    summary: 'Unified catalogue + blog site search',
    description:
      'Searches accommodations, flights, cars, cruises, activities, packages and blog posts. ' +
      'Returns typed hits with deep-links. Catalogue providers fill groups in follow-up work.',
  })
  @ApiOkResponse({ type: SiteSearchResponseDto })
  search(@Query() query: SiteSearchQueryDto) {
    return this.service.search(query);
  }
}
