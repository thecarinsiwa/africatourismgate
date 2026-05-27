import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PropertySearchQueryDto } from './dto/property-search-query.dto';
import { PublicAccommodationsService } from './public-accommodations.service';

@ApiTags('public')
@Controller('public')
export class PublicAccommodationsController {
  constructor(private readonly service: PublicAccommodationsService) {}

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
}
