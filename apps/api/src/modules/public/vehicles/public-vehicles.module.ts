import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Destinations,
  RentalAgencies,
  VehicleAvailability,
  VehicleCategories,
  Vehicles,
} from '../../../entities/generated';
import { PublicVehiclesController } from './public-vehicles.controller';
import { PublicVehiclesService } from './public-vehicles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicles,
      VehicleCategories,
      RentalAgencies,
      VehicleAvailability,
      Destinations,
    ]),
  ],
  controllers: [PublicVehiclesController],
  providers: [PublicVehiclesService],
})
export class PublicVehiclesModule {}
