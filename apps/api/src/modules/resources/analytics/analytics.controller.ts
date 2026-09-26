import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsPeriodQueryDto,
  AnalyticsTopPagesQueryDto,
} from './dto/analytics-query.dto';
import {
  AnalyticsSummaryDto,
  AnalyticsTopPagesDto,
  AnalyticsTrendDto,
} from './dto/analytics-response.dto';

@ApiTags('analytics')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @RequirePermissions('analytics.read')
  @Get('summary')
  @ApiOperation({
    summary: 'Unique visitors and page views for a period, with vs-previous deltas',
  })
  @ApiOkResponse({ type: AnalyticsSummaryDto })
  getSummary(@Query() query: AnalyticsPeriodQueryDto): Promise<AnalyticsSummaryDto> {
    return this.service.getSummary(query.period ?? '30d');
  }

  @RequirePermissions('analytics.read')
  @Get('trend')
  @ApiOperation({ summary: 'Daily visitors and page views series for a period' })
  @ApiOkResponse({ type: AnalyticsTrendDto })
  getTrend(@Query() query: AnalyticsPeriodQueryDto): Promise<AnalyticsTrendDto> {
    return this.service.getTrend(query.period ?? '30d');
  }

  @RequirePermissions('analytics.read')
  @Get('top-pages')
  @ApiOperation({ summary: 'Most viewed paths for a period' })
  @ApiOkResponse({ type: AnalyticsTopPagesDto })
  getTopPages(@Query() query: AnalyticsTopPagesQueryDto): Promise<AnalyticsTopPagesDto> {
    return this.service.getTopPages(query.period ?? '30d', query.limit ?? 10);
  }
}
