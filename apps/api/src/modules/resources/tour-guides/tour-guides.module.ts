import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingGuideAssignments,
  BookingItems,
  Bookings,
  Destinations,
  Organizations,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { BookingGuideAssignmentEmailService } from './booking-guide-assignment-email.service';
import { BookingGuideAssignmentsService } from './booking-guide-assignments.service';
import { TourGuidesController } from './tour-guides.controller';
import { TourGuidesService } from './tour-guides.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TourGuides,
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
    BookingGuideAssignmentsService,
    BookingGuideAssignmentEmailService,
  ],
  exports: [TourGuidesService, BookingGuideAssignmentsService],
})
export class TourGuidesModule {}
