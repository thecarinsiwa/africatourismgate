import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivitySchedules,
  BookingItems,
  Bookings,
  CabinAvailability,
  Cabins,
  FlightClassAvailability,
  FlightClasses,
  RoomAvailability,
  Rooms,
  Users,
  VehicleAvailability,
  Vehicles,
} from '../../../entities/generated';
import { BookingEngineService } from './booking-engine.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bookings,
      BookingItems,
      Users,
      RoomAvailability,
      Rooms,
      FlightClassAvailability,
      FlightClasses,
      VehicleAvailability,
      Vehicles,
      CabinAvailability,
      Cabins,
      ActivitySchedules,
      Activities,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingEngineService],
  exports: [BookingEngineService],
})
export class BookingsModule {}
