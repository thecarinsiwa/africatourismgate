import { Module } from '@nestjs/common';
import { PublicAccommodationsModule } from '../accommodations/public-accommodations.module';
import { PublicActivitiesModule } from '../activities/public-activities.module';
import { PublicBlogModule } from '../blog/public-blog.module';
import { PublicPackagesModule } from '../packages/public-packages.module';
import { PublicSiteSearchController } from './public-site-search.controller';
import { PublicSiteSearchService } from './public-site-search.service';

@Module({
  imports: [
    PublicAccommodationsModule,
    PublicActivitiesModule,
    PublicPackagesModule,
    PublicBlogModule,
  ],
  controllers: [PublicSiteSearchController],
  providers: [PublicSiteSearchService],
  exports: [PublicSiteSearchService],
})
export class PublicSiteSearchModule {}
