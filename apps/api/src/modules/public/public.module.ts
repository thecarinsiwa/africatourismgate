import { Module } from '@nestjs/common';
import { PublicBlogModule } from './blog/public-blog.module';
import { PublicAccommodationsModule } from './accommodations/public-accommodations.module';
import { PublicActivitiesModule } from './activities/public-activities.module';
import { PublicCruisesModule } from './cruises/public-cruises.module';
import { PublicFlightsModule } from './flights/public-flights.module';
import { PublicPackagesModule } from './packages/public-packages.module';
import { PublicVehiclesModule } from './vehicles/public-vehicles.module';

@Module({
  imports: [
    PublicBlogModule,
    PublicAccommodationsModule,
    PublicFlightsModule,
    PublicVehiclesModule,
    PublicCruisesModule,
    PublicActivitiesModule,
    PublicPackagesModule,
  ],
})
export class PublicModule {}
