import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActivitySchedules,
  CabinAvailability,
  FlightClasses,
  Packages,
  Rooms,
  VehicleAvailability,
} from '../../../entities/generated';
import { PackagesModule } from '../../resources/packages/packages.module';
import { PublicPackagesController } from './public-packages.controller';
import { PublicPackagesService } from './public-packages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Packages,
      ActivitySchedules,
      Rooms,
      FlightClasses,
      VehicleAvailability,
      CabinAvailability,
    ]),
    PackagesModule,
  ],
  controllers: [PublicPackagesController],
  providers: [PublicPackagesService],
})
export class PublicPackagesModule {}
