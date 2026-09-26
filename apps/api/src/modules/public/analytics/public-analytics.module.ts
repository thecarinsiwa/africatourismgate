import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitePageViews } from '../../../entities/site-page-view.entity';
import { PublicAnalyticsController } from './public-analytics.controller';
import { PublicAnalyticsService } from './public-analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([SitePageViews])],
  controllers: [PublicAnalyticsController],
  providers: [PublicAnalyticsService],
})
export class PublicAnalyticsModule {}
