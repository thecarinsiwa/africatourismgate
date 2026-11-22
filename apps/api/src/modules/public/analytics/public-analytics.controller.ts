import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
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
  // Only analyticsBeacon applies - without SkipThrottle, login/forgot/etc. (5/min)
  // also count and cause 429 on normal browsing / refreshes.
  @SkipThrottle({
    login: true,
    forgotPassword: true,
    activityBookingRequest: true,
  })
  @Throttle({ analyticsBeacon: { limit: 60, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record an anonymous page view from the public web app' })
  @ApiNoContentResponse({ description: 'Page view recorded' })
  trackPageView(@Body() dto: TrackPageViewDto): Promise<void> {
    return this.service.trackPageView(dto);
  }
}
