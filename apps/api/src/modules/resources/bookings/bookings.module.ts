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
import { ReviewsModule } from '../reviews/reviews.module';
import { PackagesModule } from '../packages/packages.module';
import { BookingCheckoutPromoService } from './booking-checkout-promo.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingPackageCheckoutService } from './booking-package-checkout.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import { StripeModule } from '../../stripe/stripe.module';
import { TourGuidesModule } from '../tour-guides/tour-guides.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    forwardRef(() => StripeModule),
    TourGuidesModule,
    ReviewsModule,
    PackagesModule,
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
    BookingPackageCheckoutService,
  ],
  exports: [BookingEngineService, BookingStatusHistoryService],
})
export class BookingsModule {}
