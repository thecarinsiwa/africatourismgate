import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityImages,
  Cabins,
  FlightClasses,
  FlightImages,
  Flights,
  PackageItems,
  PackageImages,
  Packages,
  Properties,
  PropertyImages,
  Rooms,
  ShipImages,
  Vehicles,
  VehicleImages,
} from '../../../entities/generated';
import { PackageImageSuggestionsService } from './package-image-suggestions.service';
import { PackageItemPricingService } from './package-item-pricing.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Packages,
      PackageItems,
      PackageImages,
      Properties,
      Rooms,
      Flights,
      FlightClasses,
      Vehicles,
      Cabins,
      Activities,
      PropertyImages,
      ActivityImages,
      FlightImages,
      VehicleImages,
      ShipImages,
    ]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService, PackageItemPricingService, PackageImageSuggestionsService],
  exports: [PackagesService],
})
export class PackagesModule {}
