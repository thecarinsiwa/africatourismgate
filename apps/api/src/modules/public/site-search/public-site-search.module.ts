import { Module } from '@nestjs/common';
import { PublicAccommodationsModule } from '../accommodations/public-accommodations.module';
import { PublicActivitiesModule } from '../activities/public-activities.module';
import { PublicSiteSearchController } from './public-site-search.controller';
import { PublicSiteSearchService } from './public-site-search.service';

@Module({
  imports: [PublicAccommodationsModule, PublicActivitiesModule],
  controllers: [PublicSiteSearchController],
  providers: [PublicSiteSearchService],
  exports: [PublicSiteSearchService],
})
export class PublicSiteSearchModule {}
