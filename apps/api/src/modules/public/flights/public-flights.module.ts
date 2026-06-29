import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Airlines,
  Airports,
  FlightClassAvailability,
  FlightClasses,
  FlightImages,
  Flights,
} from '../../../entities/generated';
import { PublicFlightsController } from './public-flights.controller';
import { PublicFlightsService } from './public-flights.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Flights,
      FlightClasses,
      FlightImages,
      FlightClassAvailability,
      Airports,
      Airlines,
    ]),
  ],
  controllers: [PublicFlightsController],
  providers: [PublicFlightsService],
})
export class PublicFlightsModule {}
