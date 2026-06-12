import { Module } from '@nestjs/common';
import { PublicAccommodationsModule } from './accommodations/public-accommodations.module';
import { PublicActivitiesModule } from './activities/public-activities.module';
import { PublicCruisesModule } from './cruises/public-cruises.module';
import { PublicFlightsModule } from './flights/public-flights.module';
import { PublicVehiclesModule } from './vehicles/public-vehicles.module';

@Module({
  imports: [
    PublicAccommodationsModule,
    PublicFlightsModule,
    PublicVehiclesModule,
    PublicCruisesModule,
    PublicActivitiesModule,
  ],
})
export class PublicModule {}
