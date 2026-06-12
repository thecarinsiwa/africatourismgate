import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { CruiseSearchQueryDto } from './dto/cruise-search-query.dto';
import { CruiseSailingDetailQueryDto } from './dto/cruise-sailing-detail-query.dto';
import { PublicCruisesService } from './public-cruises.service';

@ApiTags('public')
@Controller('public')
export class PublicCruisesController {
  constructor(private readonly service: PublicCruisesService) {}

  @Public()
  @Get('cruises/search')
  @ApiOperation({
    summary: 'Search cruise sailings by port codes and departure date range',
  })
  search(@Query() query: CruiseSearchQueryDto) {
    return this.service.search(query);
  }

  @Public()
  @Get('cruises/sailings/:id')
  @ApiOperation({
    summary: 'Sailing detail with itinerary and available cabins',
  })
  getSailingById(
    @Param('id') id: string,
    @Query() query: CruiseSailingDetailQueryDto,
  ) {
    return this.service.getSailingById(id, query);
  }
}
