import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivitySchedules,
  BookingItems,
  Bookings,
  BookingStatusHistory,
  CabinAvailability,
  Cabins,
  FlightClassAvailability,
  FlightClasses,
  Organizations,
  Payments,
  RoomAvailability,
  Rooms,
  Users,
  VehicleAvailability,
  Vehicles,
} from '../../../entities/generated';
import { BookingEngineService } from './booking-engine.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bookings,
      BookingItems,
      BookingStatusHistory,
      Users,
      Organizations,
      Payments,
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
  providers: [BookingsService, BookingEngineService, BookingStatusHistoryService],
  exports: [BookingEngineService, BookingStatusHistoryService],
})
export class BookingsModule {}
