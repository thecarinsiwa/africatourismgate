import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingGuideAssignments,
  BookingItems,
  Bookings,
  Destinations,
  GuideAvailability,
  Organizations,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { BookingsModule } from '../bookings/bookings.module';
import { BookingGuideAssignmentEmailService } from './booking-guide-assignment-email.service';
import { BookingGuideAssignmentsService } from './booking-guide-assignments.service';
import { GuideAvailabilityService } from './guide-availability.service';
import { TourGuidesController } from './tour-guides.controller';
import { TourGuidesService } from './tour-guides.service';

@Module({
  imports: [
    forwardRef(() => BookingsModule),
    TypeOrmModule.forFeature([
      TourGuides,
      GuideAvailability,
      BookingGuideAssignments,
      Bookings,
      BookingItems,
      Users,
      Organizations,
      Destinations,
    ]),
  ],
  controllers: [TourGuidesController],
  providers: [
    TourGuidesService,
    GuideAvailabilityService,
    BookingGuideAssignmentsService,
    BookingGuideAssignmentEmailService,
  ],
  exports: [TourGuidesService, GuideAvailabilityService, BookingGuideAssignmentsService],
})
export class TourGuidesModule {}
