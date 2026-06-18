import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PropertyDetailQueryDto } from './dto/property-detail-query.dto';
import { PropertySearchQueryDto } from './dto/property-search-query.dto';
import { PublicAccommodationsService } from './public-accommodations.service';

@ApiTags('public')
@Controller('public')
export class PublicAccommodationsController {
  constructor(private readonly service: PublicAccommodationsService) {}

  @Public()
  @Get('destinations/featured')
  @ApiOperation({ summary: 'List featured destinations for marketing homepage' })
  listFeaturedDestinations(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : 4;
    return this.service.listFeaturedDestinations(Number.isFinite(parsed) ? parsed : 4);
  }

  @Public()
  @Get('destinations')
  @ApiOperation({ summary: 'List destinations for public search' })
  listDestinations() {
    return this.service.listDestinations();
  }

  @Public()
  @Get('accommodations/search')
  @ApiOperation({ summary: 'Search accommodations with min nightly price' })
  search(@Query() query: PropertySearchQueryDto) {
    return this.service.search(query);
  }

  @Public()
  @Get('accommodations/:id/reviews')
  @ApiOperation({ summary: 'List guest reviews for an accommodation' })
  listReviews(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listPropertyReviews(id, query);
  }

  @Public()
  @Get('accommodations/:id')
  @ApiOperation({ summary: 'Accommodation detail with rooms and date pricing' })
  getById(@Param('id') id: string, @Query() query: PropertyDetailQueryDto) {
    return this.service.getById(id, query);
  }
}
