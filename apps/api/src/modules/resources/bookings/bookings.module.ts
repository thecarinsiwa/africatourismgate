import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingItems,
  Bookings,
  RoomAvailability,
  Rooms,
} from '../../../entities/generated';
import { BookingEngineService } from './booking-engine.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bookings,
      BookingItems,
      RoomAvailability,
      Rooms,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingEngineService],
  exports: [BookingEngineService],
})
export class BookingsModule {}
