import { Module } from '@nestjs/common';
import { PublicAccommodationsModule } from './accommodations/public-accommodations.module';
import { PublicFlightsModule } from './flights/public-flights.module';

@Module({
  imports: [PublicAccommodationsModule, PublicFlightsModule],
})
export class PublicModule {}
