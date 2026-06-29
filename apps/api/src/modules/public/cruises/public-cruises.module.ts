import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CabinAvailability,
  Cabins,
  CruiseLines,
  CruisePorts,
  CruiseSailings,
  Itineraries,
  ItineraryPorts,
  ShipImages,
  Ships,
} from '../../../entities/generated';
import { PublicCruisesController } from './public-cruises.controller';
import { PublicCruisesService } from './public-cruises.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CruiseSailings,
      Itineraries,
      ItineraryPorts,
      CruisePorts,
      Ships,
      ShipImages,
      CruiseLines,
      Cabins,
      CabinAvailability,
    ]),
  ],
  controllers: [PublicCruisesController],
  providers: [PublicCruisesService],
})
export class PublicCruisesModule {}
