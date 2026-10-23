import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../auth/decorators/public.decorator';
import { ActivityBrowseQueryDto } from './dto/activity-browse-query.dto';
import { ActivityBookingRequestResponseDto } from './dto/activity-booking-request-response.dto';
import { ActivityDetailQueryDto } from './dto/activity-detail-query.dto';
import { ActivitySearchQueryDto } from './dto/activity-search-query.dto';
import { CreateActivityBookingRequestDto } from './dto/create-activity-booking-request.dto';
import { PublicActivitiesService } from './public-activities.service';

@ApiTags('public')
@Controller('public')
export class PublicActivitiesController {
  constructor(private readonly service: PublicActivitiesService) {}

  @Public()
  @Get('activities/browse')
  @ApiOperation({
    summary: 'Browse all activities with upcoming schedule availability',
  })
  browse(@Query() query: ActivityBrowseQueryDto) {
    return this.service.browse(query);
  }

  @Public()
  @Get('activities/search')
  @ApiOperation({
    summary: 'Search activities by destination, date, and participants',
  })
  search(@Query() query: ActivitySearchQueryDto) {
    return this.service.search(query);
  }

  @Public()
  @Get('activities/destinations')
  @ApiOperation({
    summary: 'List destinations with bookable activities',
  })
  listDestinations() {
    return this.service.listDestinations();
  }

  @Public()
  @Get('activity-providers')
  @ApiOperation({
    summary:
      'List active activity partners (name, logo, destination, activity count, rating) for the public site',
  })
  listProviders() {
    return this.service.listProviders();
  }

  @Public()
  @Get('activity-providers/:id')
  @ApiOperation({
    summary: 'Activity partner detail with destination and public activities',
  })
  getProviderById(@Param('id') id: string) {
    return this.service.getProviderById(id);
  }

  @Public()
  @Post('activities/:id/booking-request')
  @UseGuards(ThrottlerGuard)
  @Throttle({ activityBookingRequest: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Submit a booking inquiry when the activity has no available slots (admin toggle required)',
  })
  submitBookingRequest(
    @Param('id') id: string,
    @Body() dto: CreateActivityBookingRequestDto,
  ): Promise<ActivityBookingRequestResponseDto> {
    return this.service.submitBookingRequest(id, dto);
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
