import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  Cabins,
  FlightClasses,
  Flights,
  PackageItems,
  Packages,
  Properties,
  Rooms,
  Vehicles,
} from '../../../entities/generated';
import { PackageItemPricingService } from './package-item-pricing.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Packages,
      PackageItems,
      Properties,
      Rooms,
      Flights,
      FlightClasses,
      Vehicles,
      Cabins,
      Activities,
    ]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService, PackageItemPricingService],
  exports: [PackagesService],
})
export class PackagesModule {}
