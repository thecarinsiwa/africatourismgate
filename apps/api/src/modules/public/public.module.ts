import { Module } from '@nestjs/common';
import { PublicAboutModule } from './about/public-about.module';
import { PublicBlogModule } from './blog/public-blog.module';
import { PublicAccommodationsModule } from './accommodations/public-accommodations.module';
import { PublicActivitiesModule } from './activities/public-activities.module';
import { PublicCruisesModule } from './cruises/public-cruises.module';
import { PublicFlightsModule } from './flights/public-flights.module';
import { PublicPackagesModule } from './packages/public-packages.module';
import { PublicReviewsModule } from './reviews/public-reviews.module';
import { PublicVehiclesModule } from './vehicles/public-vehicles.module';
import { PublicGapModule } from './gap/public-gap.module';

@Module({
  imports: [
    PublicAboutModule,
    PublicBlogModule,
    PublicAccommodationsModule,
    PublicFlightsModule,
    PublicVehiclesModule,
    PublicCruisesModule,
    PublicActivitiesModule,
    PublicPackagesModule,
    PublicReviewsModule,
    PublicGapModule,
  ],
})
export class PublicModule {}
