import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingGuideAssignments,
  Bookings,
  Destinations,
  Organizations,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { BookingGuideAssignmentsService } from './booking-guide-assignments.service';
import { TourGuidesController } from './tour-guides.controller';
import { TourGuidesService } from './tour-guides.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TourGuides,
      BookingGuideAssignments,
      Bookings,
      Users,
      Organizations,
      Destinations,
    ]),
  ],
  controllers: [TourGuidesController],
  providers: [TourGuidesService, BookingGuideAssignmentsService],
  exports: [TourGuidesService, BookingGuideAssignmentsService],
})
export class TourGuidesModule {}
