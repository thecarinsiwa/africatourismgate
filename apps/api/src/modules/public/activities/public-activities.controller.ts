import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { ActivityDetailQueryDto } from './dto/activity-detail-query.dto';
import { ActivitySearchQueryDto } from './dto/activity-search-query.dto';
import { PublicActivitiesService } from './public-activities.service';

@ApiTags('public')
@Controller('public')
export class PublicActivitiesController {
  constructor(private readonly service: PublicActivitiesService) {}

  @Public()
  @Get('activities/search')
  @ApiOperation({
    summary: 'Search activities by destination, date, and participants',
  })
  search(@Query() query: ActivitySearchQueryDto) {
    return this.service.search(query);
  }

  @Public()
  @Get('activities/:id')
  @ApiOperation({
    summary: 'Activity detail with available schedule slots',
  })
  getById(@Param('id') id: string, @Query() query: ActivityDetailQueryDto) {
    return this.service.getById(id, query);
  }
}
