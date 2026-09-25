import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../auth/decorators/public.decorator';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { PublicAnalyticsService } from './public-analytics.service';

@ApiTags('public-analytics')
@Controller('public/analytics')
export class PublicAnalyticsController {
  constructor(private readonly service: PublicAnalyticsService) {}

  @Public()
  @Post('page-views')
  @UseGuards(ThrottlerGuard)
  @Throttle({ analyticsBeacon: { limit: 60, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record an anonymous page view from the public web app' })
  @ApiNoContentResponse({ description: 'Page view recorded' })
  trackPageView(@Body() dto: TrackPageViewDto): Promise<void> {
    return this.service.trackPageView(dto);
  }
}
