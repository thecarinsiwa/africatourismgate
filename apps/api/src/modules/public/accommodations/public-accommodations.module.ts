import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Amenities,
  Destinations,
  Properties,
  PropertyAmenities,
  PropertyImages,
  RoomAvailability,
  RoomImages,
  Rooms,
} from '../../../entities/generated';
import { ReviewsModule } from '../../resources/reviews/reviews.module';
import { PublicAccommodationsController } from './public-accommodations.controller';
import { PublicAccommodationsService } from './public-accommodations.service';

@Module({
  imports: [
    ReviewsModule,
    TypeOrmModule.forFeature([
      Properties,
      Destinations,
      Rooms,
      RoomAvailability,
      PropertyImages,
      RoomImages,
      PropertyAmenities,
      Amenities,
    ]),
  ],
  controllers: [PublicAccommodationsController],
  providers: [PublicAccommodationsService],
  exports: [PublicAccommodationsService],
})
export class PublicAccommodationsModule {}
