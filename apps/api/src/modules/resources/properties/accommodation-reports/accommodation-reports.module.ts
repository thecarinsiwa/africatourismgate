import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Amenities,
  BookingItems,
  Bookings,
  Destinations,
  Organizations,
  Properties,
  PropertyAmenities,
  RoomAvailability,
  Rooms,
} from '../../../../entities/generated';
import { EmailModule } from '../../../email/email.module';
import { AccommodationReportsController } from './accommodation-reports.controller';
import { AccommodationReportsService } from './accommodation-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Properties,
      Destinations,
      Rooms,
      RoomAvailability,
      PropertyAmenities,
      Amenities,
      BookingItems,
      Bookings,
      Organizations,
    ]),
    EmailModule,
  ],
  controllers: [AccommodationReportsController],
  providers: [AccommodationReportsService],
  exports: [AccommodationReportsService],
})
export class AccommodationReportsModule {}
