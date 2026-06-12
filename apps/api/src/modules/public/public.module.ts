import { Module } from '@nestjs/common';
import { PublicAccommodationsModule } from './accommodations/public-accommodations.module';
import { PublicFlightsModule } from './flights/public-flights.module';
import { PublicVehiclesModule } from './vehicles/public-vehicles.module';

@Module({
  imports: [
    PublicAccommodationsModule,
    PublicFlightsModule,
    PublicVehiclesModule,
  ],
})
export class PublicModule {}
