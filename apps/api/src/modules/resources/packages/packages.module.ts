import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityImages,
  ActivityItineraryStops,
  ActivityProviders,
  Airports,
  Cabins,
  Destinations,
  FlightClasses,
  FlightImages,
  Flights,
  PackageItems,
  PackageDescriptionAssets,
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
import { PackageMapPointsService } from './package-map-points.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Packages,
      PackageItems,
      PackageDescriptionAssets,
      PackageImages,
      Properties,
      Rooms,
      Flights,
      FlightClasses,
      Vehicles,
      Cabins,
      Activities,
      ActivityProviders,
      ActivityItineraryStops,
      Destinations,
      Airports,
      PropertyImages,
      ActivityImages,
      FlightImages,
      VehicleImages,
      ShipImages,
    ]),
  ],
  controllers: [PackagesController],
  providers: [
    PackagesService,
    PackageItemPricingService,
    PackageImageSuggestionsService,
    PackageMapPointsService,
  ],
  exports: [PackagesService],
})
export class PackagesModule {}
