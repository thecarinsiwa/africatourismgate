import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivitySchedules,
  BookingItems,
  BookingMessages,
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
import { OrganizationSettingsModule } from '../organization-settings/organization-settings.module';
import { BookingCheckoutPromoService } from './booking-checkout-promo.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingPackageCheckoutService } from './booking-package-checkout.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import { StripeModule } from '../../stripe/stripe.module';
import { TourGuidesModule } from '../tour-guides/tour-guides.module';
import { BookingAssistedEmailService } from './booking-assisted-email.service';
import { BookingApprovalService } from './booking-approval.service';
import { BookingMessagesService } from './booking-messages.service';
import { BookingNotificationsService } from './booking-notifications.service';
import { BookingPaymentReminderService } from './booking-payment-reminder.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    forwardRef(() => StripeModule),
    OrganizationSettingsModule,
    TourGuidesModule,
    ReviewsModule,
    PackagesModule,
    TypeOrmModule.forFeature([
      Bookings,
      BookingItems,
      BookingMessages,
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
    BookingMessagesService,
    BookingApprovalService,
    BookingAssistedEmailService,
    BookingNotificationsService,
    BookingPaymentReminderService,
  ],
  exports: [
    BookingEngineService,
    BookingStatusHistoryService,
    BookingPaymentReminderService,
  ],
})
export class BookingsModule {}
