import { Module, forwardRef } from '@nestjs/common';
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
  PromoCodes,
  Promotions,
  RoomAvailability,
  Rooms,
  Users,
  VehicleAvailability,
  Vehicles,
} from '../../../entities/generated';
import { EmailModule } from '../../email/email.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { BookingCheckoutPromoService } from './booking-checkout-promo.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import { StripeModule } from '../../stripe/stripe.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    EmailModule,
    forwardRef(() => StripeModule),
    ReviewsModule,
    TypeOrmModule.forFeature([
      Bookings,
      BookingItems,
      BookingStatusHistory,
      Users,
      Organizations,
      Payments,
      PromoCodes,
      Promotions,
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
  providers: [
    BookingsService,
    BookingEngineService,
    BookingStatusHistoryService,
    BookingCheckoutPromoService,
  ],
  exports: [BookingEngineService, BookingStatusHistoryService],
})
export class BookingsModule {}
